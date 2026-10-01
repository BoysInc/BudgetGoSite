/** SVG equivalent of BudgetGo's segmented_donut_geometry.dart. */
(function () {
  "use strict";

  const fullTurn = Math.PI * 2;
  const clampUnit = function (value) {
    return Math.max(0, Math.min(1, value));
  };

  /** Returns one filled, clockwise ring sector; angles use radians. */
  function path(options) {
    const {
      cx,
      cy,
      outerRadius,
      thickness,
      startAngle,
      sweepAngle,
      cornerRadius = thickness * 0.35
    } = options;

    if (![cx, cy, outerRadius, thickness, startAngle, sweepAngle, cornerRadius].every(Number.isFinite) ||
        outerRadius <= 0 || thickness <= 0 || sweepAngle <= 0 || cornerRadius < 0) {
      return "";
    }

    const innerRadius = Math.max(0, outerRadius - thickness);
    const commands = [];
    const coordinate = function (radius, angle) {
      return [
        Number((cx + Math.cos(angle) * radius).toFixed(6)),
        Number((cy + Math.sin(angle) * radius).toFixed(6))
      ].join(" ");
    };
    const arc = function (radius, start, sweep) {
      if (sweep === 0) return;
      commands.push("A " + radius + " " + radius + " 0 " +
        (Math.abs(sweep) > Math.PI ? 1 : 0) + " " + (sweep > 0 ? 1 : 0) + " " +
        coordinate(radius, start + sweep));
    };

    // SVG needs two arcs for a complete circle. Opposite winding keeps the hole.
    if (sweepAngle >= fullTurn) {
      commands.push("M " + coordinate(outerRadius, startAngle));
      arc(outerRadius, startAngle, Math.PI);
      arc(outerRadius, startAngle + Math.PI, Math.PI);
      commands.push("Z");
      if (innerRadius > 0) {
        commands.push("M " + coordinate(innerRadius, startAngle));
        arc(innerRadius, startAngle, -Math.PI);
        arc(innerRadius, startAngle - Math.PI, -Math.PI);
        commands.push("Z");
      }
      return commands.join(" ");
    }

    const end = startAngle + sweepAngle;
    const halfSweepSine = Math.sin(Math.min(sweepAngle / 2, Math.PI / 2));
    // Fillets shrink to fit both concentric arcs, preserving narrow categories.
    const outerLimit = outerRadius * halfSweepSine / (1 + halfSweepSine);
    const innerLimit = halfSweepSine >= 1
      ? Infinity
      : innerRadius * halfSweepSine / (1 - halfSweepSine);
    const rounding = Math.min(cornerRadius, (outerRadius - innerRadius) / 2,
      outerLimit, innerLimit);
    const outerInset = rounding > 0
      ? Math.asin(clampUnit(rounding / (outerRadius - rounding)))
      : 0;
    const innerInset = rounding > 0
      ? Math.asin(clampUnit(rounding / (innerRadius + rounding)))
      : 0;
    const outerEdge = Math.sqrt(Math.max(0, outerRadius * (outerRadius - 2 * rounding)));
    const innerEdge = Math.sqrt(innerRadius * (innerRadius + 2 * rounding));
    const joinCorner = function (radius, angle) {
      commands.push(rounding > 0
        ? "A " + rounding + " " + rounding + " 0 0 1 " + coordinate(radius, angle)
        : "L " + coordinate(radius, angle));
    };

    commands.push("M " + coordinate(outerRadius, startAngle + outerInset));
    arc(outerRadius, startAngle + outerInset, Math.max(0, sweepAngle - 2 * outerInset));
    joinCorner(outerEdge, end);
    commands.push("L " + coordinate(innerEdge, end));
    joinCorner(innerRadius, end - innerInset);
    if (innerRadius > 0) {
      arc(innerRadius, end - innerInset, -Math.max(0, sweepAngle - 2 * innerInset));
    }
    joinCorner(innerEdge, startAngle);
    commands.push("L " + coordinate(outerEdge, startAngle));
    joinCorner(outerRadius, startAngle + outerInset);
    commands.push("Z");
    return commands.join(" ");
  }

  window.BudgetGoDonut = { path: path };
})();
