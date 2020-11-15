
export function drawTextureMap(ctx, texture, pts, fudgeFactor = 0.1) {
    var x0 = pts[0].x, x1 = pts[1].x, x2 = pts[2].x;
    var y0 = pts[0].y, y1 = pts[1].y, y2 = pts[2].y;
    var u0 = pts[0].u, u1 = pts[1].u, u2 = pts[2].u;
    var v0 = pts[0].v, v1 = pts[1].v, v2 = pts[2].v;

    // Set clipping area so that only pixels inside the triangle will
    // be affected by the image drawing operation
    ctx.save();
    // If we draw the triangles exactly, a small sliver of empty space is rendered between them.
    // To get around this, we draw each triangle centered at [0, 0] scaled up to 101% to
    // overlap the gap.
    var center = [(x0 + x1 + x2) / 2, (y0 + y1 + y2) / 2];
    x0 -= center[0];
    x1 -= center[0];
    x2 -= center[0];
    y0 -= center[1];
    y1 -= center[1];
    y2 -= center[1];
    ctx.translate(center[0], center[1]);
    ctx.scale(1 + fudgeFactor, 1 + fudgeFactor);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2); ctx.closePath(); ctx.clip();

    // Compute matrix transform
    var delta = u0*v1 + v0*u2 + u1*v2 - v1*u2 - v0*u1 - u0*v2;
    var delta_a = x0*v1 + v0*x2 + x1*v2 - v1*x2 - v0*x1 - x0*v2;
    var delta_b = u0*x1 + x0*u2 + u1*x2 - x1*u2 - x0*u1 - u0*x2;
    var delta_c = u0*v1*x2 + v0*x1*u2 + x0*u1*v2 - x0*v1*u2
                  - v0*u1*x2 - u0*x1*v2;
    var delta_d = y0*v1 + v0*y2 + y1*v2 - v1*y2 - v0*y1 - y0*v2;
    var delta_e = u0*y1 + y0*u2 + u1*y2 - y1*u2 - y0*u1 - u0*y2;
    var delta_f = u0*v1*y2 + v0*y1*u2 + y0*u1*v2 - y0*v1*u2
                  - v0*u1*y2 - u0*y1*v2;

    // Draw the transformed image
    ctx.transform(delta_a/delta, delta_d/delta,
                  delta_b/delta, delta_e/delta,
                  delta_c/delta, delta_f/delta);
    ctx.drawImage(texture, 0, 0);
    ctx.restore();
}