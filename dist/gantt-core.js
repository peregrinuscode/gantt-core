import { jsxs as F, jsx as g, Fragment as $t } from "react/jsx-runtime";
import { useMemo as et, useState as nt, useCallback as A, useRef as q } from "react";
function U(t) {
  const e = new Date(t);
  return e.setHours(0, 0, 0, 0), e;
}
function X(t) {
  const e = U(t), n = e.getDay(), s = n === 0 ? 6 : n - 1;
  return e.setDate(e.getDate() - s), e;
}
function Y(t) {
  const e = U(t);
  return e.setDate(1), e;
}
const yt = 864e5;
function xt(t, e) {
  return (U(e).getTime() - U(t).getTime()) / yt;
}
function W(t, e) {
  const n = new Date(t);
  return n.setDate(n.getDate() + e), n;
}
function rt(t, e) {
  const n = new Date(t);
  return n.setMonth(n.getMonth() + e), n;
}
function kt(t, e = "week") {
  if (t.length === 0) {
    const l = /* @__PURE__ */ new Date();
    return { start: W(l, -14), end: W(l, 14) };
  }
  let n = t[0].start.getTime(), s = t[0].end.getTime();
  for (const l of t)
    l.start.getTime() < n && (n = l.start.getTime()), l.end.getTime() > s && (s = l.end.getTime());
  const r = e === "month" ? 30 : 7, a = W(new Date(n), -r), o = W(new Date(s), r), i = e === "month" ? Y(a) : e === "week" ? X(a) : U(a), c = e === "month" ? Y(rt(o, 1)) : e === "week" ? W(X(o), 7) : W(U(o), 1);
  return { start: i, end: c };
}
function V(t, e, n, s) {
  if (s === "month") {
    const o = wt(e.start, t), i = st(t), l = (t.getDate() - 1) / i;
    return (Math.floor(o) + l) * n;
  }
  return xt(e.start, t) / (s === "week" ? 7 : 1) * n;
}
function ot(t, e, n, s) {
  if (s === "month") {
    const o = t / n, i = Math.floor(o), c = o - i, l = rt(e.start, i), y = st(l);
    return W(l, Math.round(c * y));
  }
  const r = s === "week" ? 7 : 1, a = t / n * r;
  return W(e.start, Math.round(a));
}
function Dt(t, e, n, s) {
  const r = [];
  if (n === "month") {
    let c = Y(t.start), l = 0;
    for (; c.getTime() < t.end.getTime(); )
      r.push({
        index: l,
        date: new Date(c),
        label: Tt(c, s),
        x: l * e,
        isWeekend: !1
      }), c = rt(c, 1), l++;
    return r;
  }
  const a = n === "week" ? 7 : 1;
  let o = n === "week" ? X(t.start) : U(t.start), i = 0;
  for (; o.getTime() < t.end.getTime(); ) {
    const c = o.getDay();
    r.push({
      index: i,
      date: new Date(o),
      label: n === "week" ? It(o, s) : Lt(o, s),
      x: i * e,
      isWeekend: c === 0 || c === 6
    }), o = W(o, a), i++;
  }
  return r;
}
function it(t, e) {
  switch (e) {
    case "day":
      return U(t);
    case "week":
      return X(t);
    case "month":
      return Y(t);
  }
}
function wt(t, e) {
  return (e.getFullYear() - t.getFullYear()) * 12 + (e.getMonth() - t.getMonth()) + (e.getDate() - t.getDate()) / st(t);
}
function st(t) {
  return new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
}
function Lt(t, e) {
  return t.toLocaleDateString(e, { month: "short", day: "numeric" });
}
function It(t, e) {
  return t.toLocaleDateString(e, { month: "short", day: "numeric" });
}
function Tt(t, e) {
  return t.toLocaleDateString(e, { month: "short", year: "numeric" });
}
const St = "#3f51b5", Mt = 0.7;
function Nt(t, e, n, s, r, a, o) {
  return et(() => {
    const i = kt(t, n), c = Dt(i, r, n, o), l = /* @__PURE__ */ new Map();
    for (const h of e)
      l.set(h.id, h.color);
    const y = /* @__PURE__ */ new Map(), $ = /* @__PURE__ */ new Map();
    for (const h of t)
      if (y.set(h.id, h), h.parentId) {
        const I = $.get(h.parentId) ?? [];
        I.push(h), $.set(h.parentId, I);
      }
    const P = [...e].sort(
      (h, I) => (h.sortOrder ?? 0) - (I.sortOrder ?? 0)
    ), D = [], w = [], v = s * Mt;
    function E(h, I, b) {
      const G = [...h].sort(
        (k, N) => (k.sortOrder ?? 0) - (N.sortOrder ?? 0)
      );
      for (const k of G) {
        const N = D.length * s, C = $.get(k.id), O = !!C && C.length > 0, f = a.has(k.id);
        D.push({
          type: "task",
          id: `task-${k.id}`,
          y: N,
          height: s,
          groupId: I,
          taskId: k.id,
          level: b,
          name: k.name,
          color: k.color ?? l.get(I),
          hasChildren: O,
          isCollapsed: f
        });
        const p = V(k.start, i, r, n), m = V(k.end, i, r, n), d = Math.max(m - p, 2), T = k.color ?? l.get(I) ?? St;
        w.push({
          taskId: k.id,
          x: p,
          y: N + (s - v) / 2,
          width: d,
          height: v,
          color: T,
          progress: k.progress,
          name: k.name
        }), C && !f && E(C, I, b + 1);
      }
    }
    if (P.length > 0)
      for (const h of P) {
        const I = t.filter(
          (N) => N.groupId === h.id && !N.parentId
        ), b = I.length > 0, G = a.has(h.id), k = D.length * s;
        if (D.push({
          type: "group",
          id: `group-${h.id}`,
          y: k,
          height: s,
          groupId: h.id,
          level: 0,
          name: h.name,
          color: h.color,
          hasChildren: b,
          isCollapsed: G
        }), !G)
          E(I, h.id, 1);
        else if (b) {
          const N = t.filter((d) => d.groupId === h.id);
          let C = N[0].start, O = N[0].end;
          for (const d of N)
            d.start < C && (C = d.start), d.end > O && (O = d.end);
          const f = V(C, i, r, n), p = V(O, i, r, n), m = Math.max(p - f, 2);
          w.push({
            taskId: `group-summary-${h.id}`,
            x: f,
            y: k + (s - v) / 2,
            width: m,
            height: v,
            color: h.color,
            progress: 0,
            name: h.name,
            isSummary: !0
          });
        }
      }
    else {
      const h = t.filter((I) => !I.parentId);
      E(h, "", 1);
    }
    const L = c.length > 0 ? c[c.length - 1].x + r : 0, z = D.length * s;
    return { rows: D, bars: w, columns: c, timeRange: i, totalWidth: L, totalHeight: z };
  }, [t, e, n, s, r, a, o]);
}
function vt(t) {
  const [e, n] = nt(
    () => new Set(t)
  ), s = A((a) => {
    n((o) => {
      const i = new Set(o);
      return i.has(a) ? i.delete(a) : i.add(a), i;
    });
  }, []), r = A(
    (a) => e.has(a),
    [e]
  );
  return { collapsedIds: e, toggleCollapse: s, isCollapsed: r };
}
function Ht() {
  const t = q(null), [e, n] = nt(0), s = A(() => {
    t.current && n(t.current.scrollLeft);
  }, []);
  return { containerRef: t, scrollLeft: e, handleScroll: s };
}
const Pt = 3, K = 10;
function At(t) {
  const {
    svgRef: e,
    ghostRectRef: n,
    bars: s,
    timeRange: r,
    columnWidth: a,
    viewMode: o,
    readOnly: i = !1,
    disabledTaskIds: c,
    onTaskMove: l,
    onTaskResize: y,
    onProgressChange: $
  } = t, [P, D] = nt(!1), w = q(null), v = q(null), E = q(!1), L = A(
    (f) => s.find((p) => p.taskId === f),
    [s]
  ), z = A(
    (f) => {
      var m;
      const p = ((m = e.current) == null ? void 0 : m.getBoundingClientRect().left) ?? 0;
      return f - p;
    },
    [e]
  ), h = A(
    (f, p, m) => {
      if (i || c != null && c.has(f)) return;
      const d = L(f);
      d && (m.target.setPointerCapture(m.pointerId), m.preventDefault(), v.current = {
        startClientX: m.clientX,
        originalBar: { ...d },
        mode: p,
        taskId: f,
        activated: !1
      }, E.current = !1);
    },
    [i, c, L]
  ), I = A(
    (f) => {
      const p = v.current;
      if (!p) return;
      const m = f.clientX - p.startClientX, { originalBar: d, mode: T, taskId: R } = p;
      if (!p.activated) {
        if (Math.abs(m) < Pt) return;
        if (p.activated = !0, E.current = !0, D(!0), w.current = {
          taskId: R,
          mode: T,
          originalBar: d,
          ghostBar: { ...d },
          ghostProgress: d.progress
        }, T !== "progress" && n.current) {
          const x = n.current;
          x.style.display = "", x.setAttribute("x", String(d.x)), x.setAttribute("y", String(d.y)), x.setAttribute("width", String(d.width)), x.setAttribute("height", String(d.height)), x.setAttribute("fill", d.color);
        }
      }
      const j = w.current;
      if (!j) return;
      const S = { ...j.originalBar };
      let _ = j.originalBar.progress;
      switch (T) {
        case "move":
          S.x = d.x + m;
          break;
        case "resize-left": {
          const x = d.x + m, M = d.width - m;
          M >= K ? (S.x = x, S.width = M) : (S.x = d.x + d.width - K, S.width = K);
          break;
        }
        case "resize-right": {
          const x = d.width + m;
          S.width = Math.max(x, K);
          break;
        }
        case "progress": {
          const Q = (z(f.clientX) - d.x) / d.width * 100;
          _ = Math.round(Math.max(0, Math.min(100, Q)));
          break;
        }
      }
      if (w.current = { ...j, ghostBar: S, ghostProgress: _ }, T !== "progress" && n.current) {
        const x = n.current;
        x.setAttribute("x", String(S.x)), x.setAttribute("y", String(S.y)), x.setAttribute("width", String(S.width)), x.setAttribute("height", String(S.height));
      }
      if (T === "progress" && e.current) {
        const x = e.current.querySelector(
          `[data-progress-task="${R}"]`
        ), M = e.current.querySelector(
          `[data-progress-handle="${R}"]`
        ), Q = d.width * (_ / 100);
        if (x) {
          const J = d.width - Q;
          x.setAttribute(
            "clip-path",
            `inset(0 ${J}px 0 0)`
          ), x.style.display = _ > 0 ? "" : "none";
        }
        M && M.setAttribute(
          "cx",
          String(d.x + Q)
        );
      }
    },
    [z, n, e]
  ), b = A(
    (f) => {
      const p = v.current;
      if (!p || (f.target.releasePointerCapture(f.pointerId), v.current = null, !p.activated))
        return;
      const m = w.current;
      if (w.current = null, n.current && (n.current.style.display = "none"), D(!1), !m) return;
      const { mode: d, taskId: T, ghostBar: R, ghostProgress: j } = m;
      queueMicrotask(() => {
        if (d === "progress")
          $ == null || $({ taskId: T, progress: j });
        else {
          const S = it(
            ot(R.x, r, a, o),
            o
          ), _ = it(
            ot(R.x + R.width, r, a, o),
            o
          );
          d === "move" ? l == null || l({ taskId: T, start: S, end: _ }) : y == null || y({ taskId: T, start: S, end: _ });
        }
      });
    },
    [r, a, o, l, y, $, n]
  ), G = A(
    (f, p) => h(f, "move", p),
    [h]
  ), k = A(
    (f, p) => h(f, "resize-left", p),
    [h]
  ), N = A(
    (f, p) => h(f, "resize-right", p),
    [h]
  ), C = A(
    (f, p) => h(f, "progress", p),
    [h]
  ), O = A(() => {
    E.current = !1;
  }, []);
  return {
    isDragging: P,
    didDrag: E.current,
    clearDidDrag: O,
    handleMoveStart: G,
    handleResizeLeftStart: k,
    handleResizeRightStart: N,
    handleProgressStart: C,
    handlePointerMove: I,
    handlePointerUp: b
  };
}
function Et({
  columns: t,
  columnWidth: e,
  height: n,
  scrollLeft: s,
  taskListWidth: r
}) {
  return /* @__PURE__ */ F("div", { className: "gantt-header", style: { height: n }, children: [
    r > 0 && /* @__PURE__ */ g(
      "div",
      {
        className: "gantt-header-cell gantt-header-cell--task-list",
        style: { width: r, height: n },
        children: "Tasks"
      }
    ),
    /* @__PURE__ */ g("div", { className: "gantt-header-dates", style: { overflow: "hidden", flex: 1 }, children: /* @__PURE__ */ g(
      "div",
      {
        style: {
          display: "flex",
          transform: `translateX(-${s}px)`
        },
        children: t.map((a) => /* @__PURE__ */ g(
          "div",
          {
            className: "gantt-header-cell",
            style: { width: e, height: n },
            children: a.label
          },
          a.index
        ))
      }
    ) })
  ] });
}
const Ct = 60, tt = 8, Bt = 5;
function Ot({
  bar: t,
  readOnly: e,
  disabled: n,
  onClick: s,
  onDoubleClick: r,
  onMoveStart: a,
  onResizeLeftStart: o,
  onResizeRightStart: i,
  onProgressStart: c,
  didDrag: l,
  clearDidDrag: y
}) {
  const P = t.width * (t.progress / 100), D = !e && !n && !t.isSummary, w = (L) => {
    if (l) {
      y == null || y(), L.stopPropagation();
      return;
    }
    s == null || s(t.taskId);
  }, v = () => {
    l || r == null || r(t.taskId);
  }, E = [
    "gantt-bar-group",
    D && "gantt-bar-group--interactive",
    n && "gantt-bar-group--disabled",
    t.isSummary && "gantt-bar-group--summary"
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ F(
    "g",
    {
      className: E,
      onClick: w,
      onDoubleClick: v,
      children: [
        /* @__PURE__ */ g(
          "rect",
          {
            className: "gantt-bar-bg",
            x: t.x,
            y: t.y,
            width: t.width,
            height: t.height,
            rx: 4,
            ry: 4,
            fill: t.color,
            onPointerDown: D ? (L) => a == null ? void 0 : a(t.taskId, L) : void 0
          }
        ),
        t.progress > 0 && /* @__PURE__ */ g(
          "rect",
          {
            className: "gantt-bar-progress",
            "data-progress-task": t.taskId,
            x: t.x,
            y: t.y,
            width: t.width,
            height: t.height,
            rx: 4,
            ry: 4,
            fill: "var(--gantt-bar-progress-fill)",
            clipPath: `inset(0 ${t.width - P}px 0 0)`
          }
        ),
        t.width > Ct && /* @__PURE__ */ g(
          "text",
          {
            className: "gantt-bar-label",
            x: t.x + t.width / 2,
            y: t.y + t.height / 2,
            children: t.name
          }
        ),
        D && /* @__PURE__ */ F($t, { children: [
          /* @__PURE__ */ g(
            "rect",
            {
              className: "gantt-bar-resize-handle",
              x: t.x,
              y: t.y,
              width: tt,
              height: t.height,
              rx: 4,
              ry: 4,
              onPointerDown: (L) => {
                L.stopPropagation(), o == null || o(t.taskId, L);
              }
            }
          ),
          /* @__PURE__ */ g(
            "rect",
            {
              className: "gantt-bar-resize-handle",
              x: t.x + t.width - tt,
              y: t.y,
              width: tt,
              height: t.height,
              rx: 4,
              ry: 4,
              onPointerDown: (L) => {
                L.stopPropagation(), i == null || i(t.taskId, L);
              }
            }
          ),
          /* @__PURE__ */ g(
            "circle",
            {
              className: "gantt-bar-progress-handle",
              "data-progress-handle": t.taskId,
              cx: t.x + P,
              cy: t.y + t.height / 2,
              r: Bt,
              onPointerDown: (L) => {
                L.stopPropagation(), c == null || c(t.taskId, L);
              }
            }
          )
        ] })
      ]
    }
  );
}
const bt = 16;
function _t({ expanded: t }) {
  return /* @__PURE__ */ g(
    "svg",
    {
      className: `gantt-chevron ${t ? "gantt-chevron--expanded" : ""}`,
      width: "12",
      height: "12",
      viewBox: "0 0 12 12",
      "aria-hidden": "true",
      children: /* @__PURE__ */ g("path", { d: "M4 2l4 4-4 4", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" })
    }
  );
}
function Rt({
  rows: t,
  width: e,
  rowHeight: n,
  totalHeight: s,
  onToggleCollapse: r
}) {
  return e <= 0 ? null : /* @__PURE__ */ g(
    "div",
    {
      className: "gantt-task-list",
      style: { width: e, minHeight: s },
      role: "list",
      children: t.map((a) => {
        const o = a.type === "group" ? a.groupId : a.taskId, i = a.level * bt;
        return /* @__PURE__ */ F(
          "div",
          {
            className: `gantt-task-list-row ${a.type === "group" ? "gantt-task-list-row--group" : ""}`,
            style: { height: n, cursor: a.hasChildren ? "pointer" : void 0 },
            role: a.hasChildren ? "button" : "listitem",
            "aria-expanded": a.hasChildren ? !a.isCollapsed : void 0,
            "aria-label": a.hasChildren ? a.isCollapsed ? `Expand ${a.name}` : `Collapse ${a.name}` : void 0,
            onClick: a.hasChildren ? () => r(o) : void 0,
            children: [
              a.type === "group" && a.color && /* @__PURE__ */ g(
                "div",
                {
                  className: "gantt-task-list-accent",
                  style: { backgroundColor: a.color }
                }
              ),
              /* @__PURE__ */ g("div", { style: { width: i, flexShrink: 0 } }),
              a.hasChildren ? /* @__PURE__ */ g("span", { className: "gantt-task-list-toggle", children: /* @__PURE__ */ g(_t, { expanded: !a.isCollapsed }) }) : /* @__PURE__ */ g("div", { className: "gantt-task-list-toggle-spacer" }),
              /* @__PURE__ */ g("span", { className: "gantt-task-list-name", title: a.name, children: a.name })
            ]
          },
          a.id
        );
      })
    }
  );
}
const B = 5, H = 12;
function Wt(t, e = 4) {
  const n = t.sourceLeft + t.sourceWidth, s = t.targetLeft + t.targetWidth, r = t.sourceTop + t.sourceHeight / 2, a = t.targetTop + t.targetHeight / 2;
  switch (t.type) {
    case "FS":
      return Ft(t, n, r, a, e);
    case "SS":
      return Gt(t, r, a, e);
    case "FF":
      return jt(n, s, r, a, e);
    case "SF":
      return Qt(t, s, r, a, e);
  }
}
function ct(t, e) {
  return [
    `${t - B},${e - B}`,
    `${t},${e}`,
    `${t - B},${e + B}`
  ].join(" ");
}
function lt(t, e) {
  return [
    `${t + B},${e - B}`,
    `${t},${e}`,
    `${t + B},${e + B}`
  ].join(" ");
}
function Ft(t, e, n, s, r) {
  const a = ct(t.targetLeft, s), o = t.targetLeft - B;
  if (t.targetLeft - e > H * 2)
    return Ut(e, n, o, s, e + H, r, a);
  const i = ht(t);
  return gt(
    e,
    n,
    "right",
    o,
    s,
    "left",
    e + H,
    t.targetLeft - H,
    i,
    r,
    a
  );
}
function Gt(t, e, n, s) {
  const r = ct(t.targetLeft, n), a = t.targetLeft - B, o = Math.min(t.sourceLeft, t.targetLeft) - H;
  return dt(
    t.sourceLeft,
    e,
    "left",
    a,
    n,
    "right",
    o,
    s,
    r
  );
}
function jt(t, e, n, s, r) {
  const a = lt(e, s), o = e + B, i = Math.max(t, e) + H;
  return dt(
    t,
    n,
    "right",
    o,
    s,
    "left",
    i,
    r,
    a
  );
}
function Qt(t, e, n, s, r) {
  const a = lt(e, s), o = e + B;
  if (t.sourceLeft - e > H * 2)
    return zt(t.sourceLeft, n, o, s, t.sourceLeft - H, r, a);
  const i = ht(t);
  return gt(
    t.sourceLeft,
    n,
    "left",
    o,
    s,
    "right",
    t.sourceLeft - H,
    e + H,
    i,
    r,
    a
  );
}
function ht(t) {
  const e = t.sourceTop + t.sourceHeight, n = t.targetTop + t.targetHeight;
  return Math.max(e, n) + t.rowHeight * 0.4;
}
function Ut(t, e, n, s, r, a, o) {
  const i = s - e;
  if (Math.abs(i) < 1)
    return { path: `M ${t},${e} L ${n},${s}`, arrowHead: o };
  const c = Math.min(a, Math.abs(i) / 2, H / 2), l = i > 0 ? 1 : -1;
  return { path: [
    `M ${t},${e}`,
    `L ${r - c},${e}`,
    `Q ${r},${e} ${r},${e + c * l}`,
    `L ${r},${s - c * l}`,
    `Q ${r},${s} ${r + c},${s}`,
    `L ${n},${s}`
  ].join(" "), arrowHead: o };
}
function zt(t, e, n, s, r, a, o) {
  const i = s - e;
  if (Math.abs(i) < 1)
    return { path: `M ${t},${e} L ${n},${s}`, arrowHead: o };
  const c = Math.min(a, Math.abs(i) / 2, H / 2), l = i > 0 ? 1 : -1;
  return { path: [
    `M ${t},${e}`,
    `L ${r + c},${e}`,
    `Q ${r},${e} ${r},${e + c * l}`,
    `L ${r},${s - c * l}`,
    `Q ${r},${s} ${r - c},${s}`,
    `L ${n},${s}`
  ].join(" "), arrowHead: o };
}
function dt(t, e, n, s, r, a, o, i, c) {
  const l = r - e, y = Math.min(i, Math.max(Math.abs(l) / 2, 1), H / 2), $ = l >= 0 ? 1 : -1, P = n === "left" ? -1 : 1, D = a === "left" ? 1 : -1;
  return { path: [
    `M ${t},${e}`,
    // Horizontal from start toward the column (stop short to leave room for curve)
    `L ${o - P * y},${e}`,
    // Curve into vertical
    `Q ${o},${e} ${o},${e + y * $}`,
    // Vertical segment to target row
    `L ${o},${r - y * $}`,
    // Curve out of vertical
    `Q ${o},${r} ${o + D * y},${r}`,
    // Horizontal to end
    `L ${s},${r}`
  ].join(" "), arrowHead: c };
}
function gt(t, e, n, s, r, a, o, i, c, l, y) {
  const $ = Math.min(l, H / 2), P = n === "left" ? -1 : 1, D = a === "left" ? 1 : -1, w = i > o ? 1 : -1;
  return { path: [
    `M ${t},${e}`,
    // Horizontal from source anchor to startColX
    `L ${o - P * $},${e}`,
    // Curve into vertical (going down toward detour)
    `Q ${o},${e} ${o},${e + $}`,
    // Vertical down to detour row
    `L ${o},${c - $}`,
    // Curve into horizontal toward endColX
    `Q ${o},${c} ${o + w * $},${c}`,
    // Horizontal across detour row
    `L ${i - w * $},${c}`,
    // Curve into vertical (going up toward target row)
    `Q ${i},${c} ${i},${c - $}`,
    // Vertical up to target row
    `L ${i},${r + $}`,
    // Curve into horizontal toward target anchor
    `Q ${i},${r} ${i + D * $},${r}`,
    // Final horizontal to arrowhead
    `L ${s},${r}`
  ].join(" "), arrowHead: y };
}
function qt({ dependencies: t, bars: e, rowHeight: n }) {
  const s = et(() => {
    const r = /* @__PURE__ */ new Map();
    for (const o of e)
      r.set(o.taskId, o);
    const a = [];
    for (const o of t) {
      const i = r.get(o.fromTaskId), c = r.get(o.toTaskId);
      if (!i || !c) continue;
      const l = Wt({
        sourceLeft: i.x,
        sourceTop: i.y,
        sourceWidth: i.width,
        sourceHeight: i.height,
        targetLeft: c.x,
        targetTop: c.y,
        targetWidth: c.width,
        targetHeight: c.height,
        rowHeight: n,
        type: o.type
      });
      a.push({
        key: `${o.fromTaskId}->${o.toTaskId}:${o.type}`,
        path: l.path,
        arrowHead: l.arrowHead
      });
    }
    return a;
  }, [t, e, n]);
  return s.length === 0 ? null : /* @__PURE__ */ g("g", { className: "gantt-dependencies-layer", children: s.map((r) => /* @__PURE__ */ F("g", { children: [
    /* @__PURE__ */ g("path", { className: "gantt-arrow-path", d: r.path }),
    /* @__PURE__ */ g("polygon", { className: "gantt-arrow-head", points: r.arrowHead })
  ] }, r.key)) });
}
const Zt = {
  day: 50,
  week: 80,
  month: 120
}, Vt = 50, Jt = 40, Kt = 0.8;
function te(t) {
  const {
    tasks: e,
    dependencies: n = [],
    groups: s = [],
    viewMode: r = "week",
    taskListWidth: a = 0,
    rowHeight: o = Vt,
    columnWidth: i,
    readOnly: c = !1,
    showDependencies: l = !0,
    showTodayMarker: y = !0,
    theme: $,
    locale: P,
    initialCollapsed: D,
    onTaskClick: w,
    onTaskDoubleClick: v,
    onTaskMove: E,
    onTaskResize: L,
    onProgressChange: z
  } = t, h = i ?? Zt[r], { collapsedIds: I, toggleCollapse: b } = vt(D), { containerRef: G, scrollLeft: k, handleScroll: N } = Ht(), C = Nt(
    e,
    s,
    r,
    o,
    h,
    I,
    P
  ), { rows: O, bars: f, columns: p, timeRange: m, totalWidth: d, totalHeight: T } = C, R = T + o * Kt, j = (u) => {
    if (u.startsWith("group-summary-")) {
      const mt = u.replace("group-summary-", "");
      b(mt);
    } else
      w == null || w(u);
  }, S = q(null), _ = q(null), x = et(
    () => new Set(e.filter((u) => u.disabled).map((u) => u.id)),
    [e]
  ), M = At({
    svgRef: S,
    ghostRectRef: _,
    bars: f,
    timeRange: m,
    columnWidth: h,
    viewMode: r,
    readOnly: c,
    disabledTaskIds: x,
    onTaskMove: E,
    onTaskResize: L,
    onProgressChange: z
  }), Q = /* @__PURE__ */ new Date(), J = V(Q, m, h, r), ut = y && Q >= m.start && Q <= m.end, ft = $ ? Object.fromEntries(
    Object.entries($).filter(([, u]) => u !== void 0)
  ) : {}, pt = [
    "gantt-core",
    M.isDragging && "gantt-core--dragging"
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ F("div", { className: pt, style: ft, children: [
    /* @__PURE__ */ g(
      Et,
      {
        columns: p,
        columnWidth: h,
        height: Jt,
        scrollLeft: k,
        taskListWidth: a
      }
    ),
    /* @__PURE__ */ g("div", { className: "gantt-body", children: /* @__PURE__ */ g(
      "div",
      {
        ref: G,
        className: "gantt-timeline-container",
        onScroll: N,
        children: /* @__PURE__ */ F("div", { className: "gantt-body-inner", style: { width: a + d }, children: [
          /* @__PURE__ */ g(
            Rt,
            {
              rows: O,
              width: a,
              rowHeight: o,
              totalHeight: T,
              onToggleCollapse: b
            }
          ),
          /* @__PURE__ */ F(
            "svg",
            {
              ref: S,
              className: `gantt-svg${c ? "" : " gantt-svg--interactive"}`,
              width: d,
              height: R,
              onPointerMove: M.handlePointerMove,
              onPointerUp: M.handlePointerUp,
              children: [
                /* @__PURE__ */ F("g", { className: "gantt-grid-layer", children: [
                  p.filter((u) => u.isWeekend).map((u) => /* @__PURE__ */ g(
                    "rect",
                    {
                      className: "gantt-weekend-rect",
                      x: u.x,
                      y: 0,
                      width: h,
                      height: T
                    },
                    `weekend-${u.index}`
                  )),
                  p.map((u) => /* @__PURE__ */ g(
                    "line",
                    {
                      className: "gantt-grid-line",
                      x1: u.x,
                      y1: 0,
                      x2: u.x,
                      y2: T
                    },
                    `line-${u.index}`
                  )),
                  O.map((u) => /* @__PURE__ */ g(
                    "line",
                    {
                      className: "gantt-grid-line",
                      x1: 0,
                      y1: u.y + u.height,
                      x2: d,
                      y2: u.y + u.height
                    },
                    `hline-${u.id}`
                  )),
                  O.filter((u) => u.type === "group").map((u) => /* @__PURE__ */ g(
                    "rect",
                    {
                      className: "gantt-group-row",
                      x: 0,
                      y: u.y,
                      width: d,
                      height: u.height
                    },
                    `group-bg-${u.id}`
                  ))
                ] }),
                l && /* @__PURE__ */ g(
                  qt,
                  {
                    dependencies: n,
                    bars: f,
                    rowHeight: o
                  }
                ),
                /* @__PURE__ */ g("g", { className: "gantt-bars-layer", children: f.map((u) => /* @__PURE__ */ g(
                  Ot,
                  {
                    bar: u,
                    readOnly: c,
                    disabled: x.has(u.taskId),
                    onClick: j,
                    onDoubleClick: v,
                    onMoveStart: M.handleMoveStart,
                    onResizeLeftStart: M.handleResizeLeftStart,
                    onResizeRightStart: M.handleResizeRightStart,
                    onProgressStart: M.handleProgressStart,
                    didDrag: M.didDrag,
                    clearDidDrag: M.clearDidDrag
                  },
                  u.taskId
                )) }),
                /* @__PURE__ */ g("g", { className: "gantt-ghost-layer", children: /* @__PURE__ */ g(
                  "rect",
                  {
                    ref: _,
                    className: "gantt-bar-ghost",
                    rx: 4,
                    ry: 4,
                    style: { display: "none" }
                  }
                ) }),
                ut && /* @__PURE__ */ g("g", { className: "gantt-today-layer", children: /* @__PURE__ */ g(
                  "line",
                  {
                    className: "gantt-today-line",
                    x1: J,
                    y1: 0,
                    x2: J,
                    y2: T
                  }
                ) })
              ]
            }
          )
        ] })
      }
    ) })
  ] });
}
function at(t) {
  const e = t.replace("#", "");
  return e.length === 3 ? [
    parseInt(e[0] + e[0], 16),
    parseInt(e[1] + e[1], 16),
    parseInt(e[2] + e[2], 16)
  ] : [
    parseInt(e.slice(0, 2), 16),
    parseInt(e.slice(2, 4), 16),
    parseInt(e.slice(4, 6), 16)
  ];
}
function Z(t) {
  return Math.max(0, Math.min(255, Math.round(t)));
}
function ee(t, e = 40) {
  const [n, s, r] = at(t);
  return `#${Z(n - e).toString(16).padStart(2, "0")}${Z(s - e).toString(16).padStart(2, "0")}${Z(r - e).toString(16).padStart(2, "0")}`;
}
function ne(t, e = 40) {
  const [n, s, r] = at(t);
  return `#${Z(n + e).toString(16).padStart(2, "0")}${Z(s + e).toString(16).padStart(2, "0")}${Z(r + e).toString(16).padStart(2, "0")}`;
}
function re(t, e) {
  const [n, s, r] = at(t);
  return `rgba(${n}, ${s}, ${r}, ${e})`;
}
export {
  te as GanttChart,
  Wt as computeArrowPath,
  ee as darkenHex,
  re as hexToRgba,
  ne as lightenHex,
  vt as useGanttTree
};
