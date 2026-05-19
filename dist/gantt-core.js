import { jsxs as G, jsx as h, Fragment as kt } from "react/jsx-runtime";
import { useMemo as rt, useState as at, useCallback as B, useRef as Z } from "react";
function z(t) {
  const e = new Date(t);
  return e.setHours(0, 0, 0, 0), e;
}
function Y(t) {
  const e = z(t), s = e.getDay(), r = s === 0 ? 6 : s - 1;
  return e.setDate(e.getDate() - r), e;
}
function tt(t) {
  const e = z(t);
  return e.setDate(1), e;
}
const Dt = 864e5;
function wt(t, e) {
  return (z(e).getTime() - z(t).getTime()) / Dt;
}
function Q(t, e) {
  const s = new Date(t);
  return s.setDate(s.getDate() + e), s;
}
function ot(t, e) {
  const s = new Date(t);
  return s.setMonth(s.getMonth() + e), s;
}
function It(t, e = "week") {
  if (t.length === 0) {
    const d = /* @__PURE__ */ new Date();
    return { start: Q(d, -14), end: Q(d, 14) };
  }
  let s = t[0].start.getTime(), r = t[0].end.getTime();
  for (const d of t)
    d.start.getTime() < s && (s = d.start.getTime()), d.end.getTime() > r && (r = d.end.getTime());
  const n = e === "month" ? 30 : 7, a = Q(new Date(s), -n), o = Q(new Date(r), n), i = e === "month" ? tt(a) : e === "week" ? Y(a) : z(a), l = e === "month" ? tt(ot(o, 1)) : e === "week" ? Q(Y(o), 7) : Q(z(o), 1);
  return { start: i, end: l };
}
function q(t, e, s, r) {
  if (r === "month") {
    const o = Lt(e.start, t), i = it(t), d = (t.getDate() - 1) / i;
    return (Math.floor(o) + d) * s;
  }
  return wt(e.start, t) / (r === "week" ? 7 : 1) * s;
}
function et(t, e, s, r) {
  if (r === "month") {
    const o = t / s, i = Math.floor(o), l = o - i, d = ot(e.start, i), D = it(d);
    return Q(d, Math.round(l * D));
  }
  const n = r === "week" ? 7 : 1, a = t / s * n;
  return Q(e.start, Math.round(a));
}
function Tt(t, e, s, r) {
  const n = [];
  if (s === "month") {
    let l = tt(t.start), d = 0;
    for (; l.getTime() < t.end.getTime(); )
      n.push({
        index: d,
        date: new Date(l),
        label: Mt(l, r),
        x: d * e,
        isWeekend: !1
      }), l = ot(l, 1), d++;
    return n;
  }
  const a = s === "week" ? 7 : 1;
  let o = s === "week" ? Y(t.start) : z(t.start), i = 0;
  for (; o.getTime() < t.end.getTime(); ) {
    const l = o.getDay();
    n.push({
      index: i,
      date: new Date(o),
      label: s === "week" ? St(o, r) : Nt(o, r),
      x: i * e,
      isWeekend: l === 0 || l === 6
    }), o = Q(o, a), i++;
  }
  return n;
}
function nt(t, e) {
  switch (e) {
    case "day":
      return z(t);
    case "week":
      return Y(t);
    case "month":
      return tt(t);
  }
}
function Lt(t, e) {
  return (e.getFullYear() - t.getFullYear()) * 12 + (e.getMonth() - t.getMonth()) + (e.getDate() - t.getDate()) / it(t);
}
function it(t) {
  return new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
}
function Nt(t, e) {
  return t.toLocaleDateString(e, { month: "short", day: "numeric" });
}
function St(t, e) {
  return t.toLocaleDateString(e, { month: "short", day: "numeric" });
}
function Mt(t, e) {
  return t.toLocaleDateString(e, { month: "short", year: "numeric" });
}
const vt = "#3f51b5", Ct = 0.7;
function At(t, e, s, r, n, a, o) {
  return rt(() => {
    const i = It(t, s), l = Tt(i, n, s, o), d = /* @__PURE__ */ new Map();
    for (const c of e)
      d.set(c.id, c.color);
    const D = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Map();
    for (const c of t)
      if (D.set(c.id, c), c.parentId) {
        const k = x.get(c.parentId) ?? [];
        k.push(c), x.set(c.parentId, k);
      }
    const A = [...e].sort(
      (c, k) => (c.sortOrder ?? 0) - (k.sortOrder ?? 0)
    ), N = [], w = [], S = r * Ct;
    function O(c, k, P) {
      const v = [...c].sort(
        (f, M) => (f.sortOrder ?? 0) - (M.sortOrder ?? 0)
      );
      for (const f of v) {
        const M = N.length * r, E = x.get(f.id), R = !!E && E.length > 0, p = a.has(f.id);
        N.push({
          type: "task",
          id: `task-${f.id}`,
          y: M,
          height: r,
          groupId: k,
          taskId: f.id,
          level: P,
          name: f.name,
          color: f.color ?? d.get(k),
          hasChildren: R,
          isCollapsed: p
        });
        const m = f.color ?? d.get(k) ?? vt, y = f.start.getTime() === f.end.getTime(), g = f.severity ?? (f.critical ? "critical" : void 0), I = g === "critical";
        if (y) {
          const C = q(f.start, i, n, s);
          w.push({
            taskId: f.id,
            x: C - S / 2,
            y: M + (r - S) / 2,
            width: S,
            height: S,
            color: m,
            progress: 0,
            name: f.name,
            kind: "milestone",
            critical: I,
            severity: g,
            indicators: f.indicators
          });
        } else {
          const C = q(f.start, i, n, s), F = q(f.end, i, n, s), T = Math.max(F - C, 2);
          w.push({
            taskId: f.id,
            x: C,
            y: M + (r - S) / 2,
            width: T,
            height: S,
            color: m,
            progress: f.progress,
            name: f.name,
            kind: "bar",
            critical: I,
            severity: g,
            indicators: f.indicators
          });
        }
        E && !p && O(E, k, P + 1);
      }
    }
    if (A.length > 0)
      for (const c of A) {
        const k = t.filter(
          (M) => M.groupId === c.id && !M.parentId
        ), P = k.length > 0, v = a.has(c.id), f = N.length * r;
        if (N.push({
          type: "group",
          id: `group-${c.id}`,
          y: f,
          height: r,
          groupId: c.id,
          level: 0,
          name: c.name,
          color: c.color,
          hasChildren: P,
          isCollapsed: v
        }), !v)
          O(k, c.id, 1);
        else if (P) {
          const M = t.filter((g) => g.groupId === c.id);
          let E = M[0].start, R = M[0].end;
          for (const g of M)
            g.start < E && (E = g.start), g.end > R && (R = g.end);
          const p = q(E, i, n, s), m = q(R, i, n, s), y = Math.max(m - p, 2);
          w.push({
            taskId: `group-summary-${c.id}`,
            x: p,
            y: f + (r - S) / 2,
            width: y,
            height: S,
            color: c.color,
            progress: 0,
            name: c.name,
            kind: "bar",
            isSummary: !0
          });
        }
      }
    else {
      const c = t.filter((k) => !k.parentId);
      O(c, "", 1);
    }
    const j = l.length > 0 ? l[l.length - 1].x + n : 0, b = N.length * r;
    return { rows: N, bars: w, columns: l, timeRange: i, totalWidth: j, totalHeight: b };
  }, [t, e, s, r, n, a, o]);
}
function Pt(t) {
  const [e, s] = at(
    () => new Set(t)
  ), r = B((a) => {
    s((o) => {
      const i = new Set(o);
      return i.has(a) ? i.delete(a) : i.add(a), i;
    });
  }, []), n = B(
    (a) => e.has(a),
    [e]
  );
  return { collapsedIds: e, toggleCollapse: r, isCollapsed: n };
}
function Et() {
  const t = Z(null), [e, s] = at(0), r = B(() => {
    t.current && s(t.current.scrollLeft);
  }, []);
  return { containerRef: t, scrollLeft: e, handleScroll: r };
}
const Ht = 3, K = 10;
function Ot(t) {
  const {
    svgRef: e,
    ghostRectRef: s,
    bars: r,
    timeRange: n,
    columnWidth: a,
    viewMode: o,
    readOnly: i = !1,
    disabledTaskIds: l,
    onTaskMove: d,
    onTaskResize: D,
    onProgressChange: x
  } = t, [A, N] = at(!1), w = Z(null), S = Z(null), O = Z(!1), j = B(
    (p) => r.find((m) => m.taskId === p),
    [r]
  ), b = B(
    (p) => {
      var y;
      const m = ((y = e.current) == null ? void 0 : y.getBoundingClientRect().left) ?? 0;
      return p - m;
    },
    [e]
  ), c = B(
    (p, m, y) => {
      if (i || l != null && l.has(p)) return;
      const g = j(p);
      g && (y.target.setPointerCapture(y.pointerId), y.preventDefault(), S.current = {
        startClientX: y.clientX,
        originalBar: { ...g },
        mode: m,
        taskId: p,
        activated: !1
      }, O.current = !1);
    },
    [i, l, j]
  ), k = B(
    (p) => {
      const m = S.current;
      if (!m) return;
      const y = p.clientX - m.startClientX, { originalBar: g, mode: I, taskId: C } = m;
      if (!m.activated) {
        if (Math.abs(y) < Ht) return;
        if (m.activated = !0, O.current = !0, N(!0), w.current = {
          taskId: C,
          mode: I,
          originalBar: g,
          ghostBar: { ...g },
          ghostProgress: g.progress
        }, I !== "progress" && s.current) {
          const $ = s.current;
          $.style.display = "", $.setAttribute("x", String(g.x)), $.setAttribute("y", String(g.y)), $.setAttribute("width", String(g.width)), $.setAttribute("height", String(g.height)), $.setAttribute("fill", g.color);
        }
      }
      const F = w.current;
      if (!F) return;
      const T = { ...F.originalBar };
      let W = F.originalBar.progress;
      switch (I) {
        case "move":
          T.x = g.x + y;
          break;
        case "resize-left": {
          const $ = g.x + y, L = g.width - y;
          L >= K ? (T.x = $, T.width = L) : (T.x = g.x + g.width - K, T.width = K);
          break;
        }
        case "resize-right": {
          const $ = g.width + y;
          T.width = Math.max($, K);
          break;
        }
        case "progress": {
          const U = (b(p.clientX) - g.x) / g.width * 100;
          W = Math.round(Math.max(0, Math.min(100, U)));
          break;
        }
      }
      if (w.current = { ...F, ghostBar: T, ghostProgress: W }, I !== "progress" && s.current) {
        const $ = s.current;
        $.setAttribute("x", String(T.x)), $.setAttribute("y", String(T.y)), $.setAttribute("width", String(T.width)), $.setAttribute("height", String(T.height));
      }
      if (I === "progress" && e.current) {
        const $ = e.current.querySelector(
          `[data-progress-task="${C}"]`
        ), L = e.current.querySelector(
          `[data-progress-handle="${C}"]`
        ), U = g.width * (W / 100);
        if ($) {
          const J = g.width - U;
          $.setAttribute(
            "clip-path",
            `inset(0 ${J}px 0 0)`
          ), $.style.display = W > 0 ? "" : "none";
        }
        L && L.setAttribute(
          "cx",
          String(g.x + U)
        );
      }
    },
    [b, s, e]
  ), P = B(
    (p) => {
      const m = S.current;
      if (!m || (p.target.releasePointerCapture(p.pointerId), S.current = null, !m.activated))
        return;
      const y = w.current;
      if (w.current = null, s.current && (s.current.style.display = "none"), N(!1), !y) return;
      const { mode: g, taskId: I, ghostBar: C, ghostProgress: F } = y;
      queueMicrotask(() => {
        if (g === "progress") {
          x == null || x({ taskId: I, progress: F });
          return;
        }
        if (y.originalBar.kind === "milestone") {
          const $ = C.x + C.width / 2, L = nt(
            et($, n, a, o),
            o
          );
          d == null || d({ taskId: I, start: L, end: L });
          return;
        }
        const T = nt(
          et(C.x, n, a, o),
          o
        ), W = nt(
          et(C.x + C.width, n, a, o),
          o
        );
        g === "move" ? d == null || d({ taskId: I, start: T, end: W }) : D == null || D({ taskId: I, start: T, end: W });
      });
    },
    [n, a, o, d, D, x, s]
  ), v = B(
    (p, m) => c(p, "move", m),
    [c]
  ), f = B(
    (p, m) => c(p, "resize-left", m),
    [c]
  ), M = B(
    (p, m) => c(p, "resize-right", m),
    [c]
  ), E = B(
    (p, m) => c(p, "progress", m),
    [c]
  ), R = B(() => {
    O.current = !1;
  }, []);
  return {
    isDragging: A,
    didDrag: O.current,
    clearDidDrag: R,
    handleMoveStart: v,
    handleResizeLeftStart: f,
    handleResizeRightStart: M,
    handleProgressStart: E,
    handlePointerMove: k,
    handlePointerUp: P
  };
}
function Bt({
  columns: t,
  columnWidth: e,
  height: s,
  scrollLeft: r,
  taskListWidth: n
}) {
  return /* @__PURE__ */ G("div", { className: "gantt-header", style: { height: s }, children: [
    n > 0 && /* @__PURE__ */ h(
      "div",
      {
        className: "gantt-header-cell gantt-header-cell--task-list",
        style: { width: n, height: s },
        children: "Tasks"
      }
    ),
    /* @__PURE__ */ h("div", { className: "gantt-header-dates", style: { overflow: "hidden", flex: 1 }, children: /* @__PURE__ */ h(
      "div",
      {
        style: {
          display: "flex",
          transform: `translateX(-${r}px)`
        },
        children: t.map((a) => /* @__PURE__ */ h(
          "div",
          {
            className: "gantt-header-cell",
            style: { width: e, height: s },
            children: a.label
          },
          a.index
        ))
      }
    ) })
  ] });
}
const _t = 60, st = 8, Rt = 5, lt = 4, X = 6;
function dt(t, e) {
  const s = t.x + X, r = t.x + t.width - X, n = t.y + X, a = t.y + t.height - X;
  switch (e.position) {
    case "top-left":
      return { cx: s, cy: n };
    case "bottom-right":
      return { cx: r, cy: a };
    case "bottom-left":
      return { cx: s, cy: a };
    case "top-right":
    default:
      return { cx: r, cy: n };
  }
}
function Ft({
  bar: t,
  readOnly: e,
  disabled: s,
  onClick: r,
  onDoubleClick: n,
  onMoveStart: a,
  onResizeLeftStart: o,
  onResizeRightStart: i,
  onProgressStart: l,
  didDrag: d,
  clearDidDrag: D
}) {
  const A = !e && !s && !t.isSummary, N = (c) => {
    if (d) {
      D == null || D(), c.stopPropagation();
      return;
    }
    r == null || r(t.taskId);
  }, w = () => {
    d || n == null || n(t.taskId);
  }, S = t.severity === "warning" ? "gantt-bar-group--warning" : t.severity === "critical" || t.critical ? "gantt-bar-group--critical" : null, O = [
    "gantt-bar-group",
    A && "gantt-bar-group--interactive",
    s && "gantt-bar-group--disabled",
    t.isSummary && "gantt-bar-group--summary",
    S,
    t.kind === "milestone" && "gantt-bar-group--milestone"
  ].filter(Boolean).join(" "), j = t.indicators ?? [];
  if (t.kind === "milestone") {
    const c = t.x + t.width / 2, k = t.y + t.height / 2, P = [
      `${c},${t.y}`,
      `${t.x + t.width},${k}`,
      `${c},${t.y + t.height}`,
      `${t.x},${k}`
    ].join(" ");
    return /* @__PURE__ */ G(
      "g",
      {
        className: O,
        onClick: N,
        onDoubleClick: w,
        children: [
          /* @__PURE__ */ h(
            "polygon",
            {
              className: "gantt-milestone",
              points: P,
              fill: t.color,
              onPointerDown: A ? (v) => a == null ? void 0 : a(t.taskId, v) : void 0
            }
          ),
          /* @__PURE__ */ h(
            "text",
            {
              className: "gantt-milestone-label",
              x: t.x + t.width + 6,
              y: k,
              children: t.name
            }
          ),
          j.map((v, f) => {
            const { cx: M, cy: E } = dt(t, v);
            return /* @__PURE__ */ h(
              "circle",
              {
                className: "gantt-bar-indicator",
                cx: M,
                cy: E,
                r: lt,
                fill: v.color,
                children: v.label && /* @__PURE__ */ h("title", { children: v.label })
              },
              `ind-${f}`
            );
          })
        ]
      }
    );
  }
  const b = t.width * (t.progress / 100);
  return /* @__PURE__ */ G(
    "g",
    {
      className: O,
      onClick: N,
      onDoubleClick: w,
      children: [
        /* @__PURE__ */ h(
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
            onPointerDown: A ? (c) => a == null ? void 0 : a(t.taskId, c) : void 0
          }
        ),
        t.progress > 0 && /* @__PURE__ */ h(
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
            clipPath: `inset(0 ${t.width - b}px 0 0)`
          }
        ),
        t.width > _t && /* @__PURE__ */ h(
          "text",
          {
            className: "gantt-bar-label",
            x: t.x + t.width / 2,
            y: t.y + t.height / 2,
            children: t.name
          }
        ),
        A && /* @__PURE__ */ G(kt, { children: [
          /* @__PURE__ */ h(
            "rect",
            {
              className: "gantt-bar-resize-handle",
              x: t.x,
              y: t.y,
              width: st,
              height: t.height,
              rx: 4,
              ry: 4,
              onPointerDown: (c) => {
                c.stopPropagation(), o == null || o(t.taskId, c);
              }
            }
          ),
          /* @__PURE__ */ h(
            "rect",
            {
              className: "gantt-bar-resize-handle",
              x: t.x + t.width - st,
              y: t.y,
              width: st,
              height: t.height,
              rx: 4,
              ry: 4,
              onPointerDown: (c) => {
                c.stopPropagation(), i == null || i(t.taskId, c);
              }
            }
          ),
          /* @__PURE__ */ h(
            "circle",
            {
              className: "gantt-bar-progress-handle",
              "data-progress-handle": t.taskId,
              cx: t.x + b,
              cy: t.y + t.height / 2,
              r: Rt,
              onPointerDown: (c) => {
                c.stopPropagation(), l == null || l(t.taskId, c);
              }
            }
          )
        ] }),
        j.map((c, k) => {
          const { cx: P, cy: v } = dt(t, c);
          return /* @__PURE__ */ h(
            "circle",
            {
              className: "gantt-bar-indicator",
              cx: P,
              cy: v,
              r: lt,
              fill: c.color,
              children: c.label && /* @__PURE__ */ h("title", { children: c.label })
            },
            `ind-${k}`
          );
        })
      ]
    }
  );
}
const Wt = 16;
function Gt({ expanded: t }) {
  return /* @__PURE__ */ h(
    "svg",
    {
      className: `gantt-chevron ${t ? "gantt-chevron--expanded" : ""}`,
      width: "12",
      height: "12",
      viewBox: "0 0 12 12",
      "aria-hidden": "true",
      children: /* @__PURE__ */ h("path", { d: "M4 2l4 4-4 4", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" })
    }
  );
}
function jt({
  rows: t,
  width: e,
  rowHeight: s,
  totalHeight: r,
  onToggleCollapse: n
}) {
  return e <= 0 ? null : /* @__PURE__ */ h(
    "div",
    {
      className: "gantt-task-list",
      style: { width: e, minHeight: r },
      role: "list",
      children: t.map((a) => {
        const o = a.type === "group" ? a.groupId : a.taskId, i = a.level * Wt;
        return /* @__PURE__ */ G(
          "div",
          {
            className: `gantt-task-list-row ${a.type === "group" ? "gantt-task-list-row--group" : ""}`,
            style: { height: s, cursor: a.hasChildren ? "pointer" : void 0 },
            role: a.hasChildren ? "button" : "listitem",
            "aria-expanded": a.hasChildren ? !a.isCollapsed : void 0,
            "aria-label": a.hasChildren ? a.isCollapsed ? `Expand ${a.name}` : `Collapse ${a.name}` : void 0,
            onClick: a.hasChildren ? () => n(o) : void 0,
            children: [
              a.type === "group" && a.color && /* @__PURE__ */ h(
                "div",
                {
                  className: "gantt-task-list-accent",
                  style: { backgroundColor: a.color }
                }
              ),
              /* @__PURE__ */ h("div", { style: { width: i, flexShrink: 0 } }),
              a.hasChildren ? /* @__PURE__ */ h("span", { className: "gantt-task-list-toggle", children: /* @__PURE__ */ h(Gt, { expanded: !a.isCollapsed }) }) : /* @__PURE__ */ h("div", { className: "gantt-task-list-toggle-spacer" }),
              /* @__PURE__ */ h("span", { className: "gantt-task-list-name", title: a.name, children: a.name })
            ]
          },
          a.id
        );
      })
    }
  );
}
const _ = 5, H = 12;
function bt(t, e = 4) {
  const s = t.sourceLeft + t.sourceWidth, r = t.targetLeft + t.targetWidth, n = t.sourceTop + t.sourceHeight / 2, a = t.targetTop + t.targetHeight / 2;
  switch (t.type) {
    case "FS":
      return Qt(t, s, n, a, e);
    case "SS":
      return Ut(t, n, a, e);
    case "FF":
      return zt(s, r, n, a, e);
    case "SF":
      return qt(t, r, n, a, e);
  }
}
function ht(t, e) {
  return [
    `${t - _},${e - _}`,
    `${t},${e}`,
    `${t - _},${e + _}`
  ].join(" ");
}
function gt(t, e) {
  return [
    `${t + _},${e - _}`,
    `${t},${e}`,
    `${t + _},${e + _}`
  ].join(" ");
}
function Qt(t, e, s, r, n) {
  const a = ht(t.targetLeft, r), o = t.targetLeft - _;
  if (t.targetLeft - e > H * 2)
    return Zt(e, s, o, r, e + H, n, a);
  const i = ut(t);
  return pt(
    e,
    s,
    "right",
    o,
    r,
    "left",
    e + H,
    t.targetLeft - H,
    i,
    n,
    a
  );
}
function Ut(t, e, s, r) {
  const n = ht(t.targetLeft, s), a = t.targetLeft - _, o = Math.min(t.sourceLeft, t.targetLeft) - H;
  return ft(
    t.sourceLeft,
    e,
    "left",
    a,
    s,
    "right",
    o,
    r,
    n
  );
}
function zt(t, e, s, r, n) {
  const a = gt(e, r), o = e + _, i = Math.max(t, e) + H;
  return ft(
    t,
    s,
    "right",
    o,
    r,
    "left",
    i,
    n,
    a
  );
}
function qt(t, e, s, r, n) {
  const a = gt(e, r), o = e + _;
  if (t.sourceLeft - e > H * 2)
    return Vt(t.sourceLeft, s, o, r, t.sourceLeft - H, n, a);
  const i = ut(t);
  return pt(
    t.sourceLeft,
    s,
    "left",
    o,
    r,
    "right",
    t.sourceLeft - H,
    e + H,
    i,
    n,
    a
  );
}
function ut(t) {
  const e = t.sourceTop + t.sourceHeight, s = t.targetTop + t.targetHeight;
  return Math.max(e, s) + t.rowHeight * 0.4;
}
function Zt(t, e, s, r, n, a, o) {
  const i = r - e;
  if (Math.abs(i) < 1)
    return { path: `M ${t},${e} L ${s},${r}`, arrowHead: o };
  const l = Math.min(a, Math.abs(i) / 2, H / 2), d = i > 0 ? 1 : -1;
  return { path: [
    `M ${t},${e}`,
    `L ${n - l},${e}`,
    `Q ${n},${e} ${n},${e + l * d}`,
    `L ${n},${r - l * d}`,
    `Q ${n},${r} ${n + l},${r}`,
    `L ${s},${r}`
  ].join(" "), arrowHead: o };
}
function Vt(t, e, s, r, n, a, o) {
  const i = r - e;
  if (Math.abs(i) < 1)
    return { path: `M ${t},${e} L ${s},${r}`, arrowHead: o };
  const l = Math.min(a, Math.abs(i) / 2, H / 2), d = i > 0 ? 1 : -1;
  return { path: [
    `M ${t},${e}`,
    `L ${n + l},${e}`,
    `Q ${n},${e} ${n},${e + l * d}`,
    `L ${n},${r - l * d}`,
    `Q ${n},${r} ${n - l},${r}`,
    `L ${s},${r}`
  ].join(" "), arrowHead: o };
}
function ft(t, e, s, r, n, a, o, i, l) {
  const d = n - e, D = Math.min(i, Math.max(Math.abs(d) / 2, 1), H / 2), x = d >= 0 ? 1 : -1, A = s === "left" ? -1 : 1, N = a === "left" ? 1 : -1;
  return { path: [
    `M ${t},${e}`,
    // Horizontal from start toward the column (stop short to leave room for curve)
    `L ${o - A * D},${e}`,
    // Curve into vertical
    `Q ${o},${e} ${o},${e + D * x}`,
    // Vertical segment to target row
    `L ${o},${n - D * x}`,
    // Curve out of vertical
    `Q ${o},${n} ${o + N * D},${n}`,
    // Horizontal to end
    `L ${r},${n}`
  ].join(" "), arrowHead: l };
}
function pt(t, e, s, r, n, a, o, i, l, d, D) {
  const x = Math.min(d, H / 2), A = s === "left" ? -1 : 1, N = a === "left" ? 1 : -1, w = i > o ? 1 : -1;
  return { path: [
    `M ${t},${e}`,
    // Horizontal from source anchor to startColX
    `L ${o - A * x},${e}`,
    // Curve into vertical (going down toward detour)
    `Q ${o},${e} ${o},${e + x}`,
    // Vertical down to detour row
    `L ${o},${l - x}`,
    // Curve into horizontal toward endColX
    `Q ${o},${l} ${o + w * x},${l}`,
    // Horizontal across detour row
    `L ${i - w * x},${l}`,
    // Curve into vertical (going up toward target row)
    `Q ${i},${l} ${i},${l - x}`,
    // Vertical up to target row
    `L ${i},${n + x}`,
    // Curve into horizontal toward target anchor
    `Q ${i},${n} ${i + N * x},${n}`,
    // Final horizontal to arrowhead
    `L ${r},${n}`
  ].join(" "), arrowHead: D };
}
function Jt({ dependencies: t, bars: e, rowHeight: s }) {
  const r = rt(() => {
    const n = /* @__PURE__ */ new Map();
    for (const o of e)
      n.set(o.taskId, o);
    const a = [];
    for (const o of t) {
      const i = n.get(o.fromTaskId), l = n.get(o.toTaskId);
      if (!i || !l) continue;
      const d = bt({
        sourceLeft: i.x,
        sourceTop: i.y,
        sourceWidth: i.width,
        sourceHeight: i.height,
        targetLeft: l.x,
        targetTop: l.y,
        targetWidth: l.width,
        targetHeight: l.height,
        rowHeight: s,
        type: o.type
      });
      a.push({
        key: `${o.fromTaskId}->${o.toTaskId}:${o.type}`,
        path: d.path,
        arrowHead: d.arrowHead
      });
    }
    return a;
  }, [t, e, s]);
  return r.length === 0 ? null : /* @__PURE__ */ h("g", { className: "gantt-dependencies-layer", children: r.map((n) => /* @__PURE__ */ G("g", { children: [
    /* @__PURE__ */ h("path", { className: "gantt-arrow-path", d: n.path }),
    /* @__PURE__ */ h("polygon", { className: "gantt-arrow-head", points: n.arrowHead })
  ] }, n.key)) });
}
const Kt = {
  day: 50,
  week: 80,
  month: 120
}, Xt = 50, Yt = 40, te = 0.8;
function se(t) {
  const {
    tasks: e,
    dependencies: s = [],
    groups: r = [],
    viewMode: n = "week",
    taskListWidth: a = 0,
    rowHeight: o = Xt,
    columnWidth: i,
    readOnly: l = !1,
    showDependencies: d = !0,
    showTodayMarker: D = !0,
    theme: x,
    locale: A,
    initialCollapsed: N,
    onTaskClick: w,
    onTaskDoubleClick: S,
    onTaskMove: O,
    onTaskResize: j,
    onProgressChange: b
  } = t, c = i ?? Kt[n], { collapsedIds: k, toggleCollapse: P } = Pt(N), { containerRef: v, scrollLeft: f, handleScroll: M } = Et(), E = At(
    e,
    r,
    n,
    o,
    c,
    k,
    A
  ), { rows: R, bars: p, columns: m, timeRange: y, totalWidth: g, totalHeight: I } = E, C = I + o * te, F = (u) => {
    if (u.startsWith("group-summary-")) {
      const xt = u.replace("group-summary-", "");
      P(xt);
    } else
      w == null || w(u);
  }, T = Z(null), W = Z(null), $ = rt(
    () => new Set(e.filter((u) => u.disabled).map((u) => u.id)),
    [e]
  ), L = Ot({
    svgRef: T,
    ghostRectRef: W,
    bars: p,
    timeRange: y,
    columnWidth: c,
    viewMode: n,
    readOnly: l,
    disabledTaskIds: $,
    onTaskMove: O,
    onTaskResize: j,
    onProgressChange: b
  }), U = /* @__PURE__ */ new Date(), J = q(U, y, c, n), mt = D && U >= y.start && U <= y.end, yt = x ? Object.fromEntries(
    Object.entries(x).filter(([, u]) => u !== void 0)
  ) : {}, $t = [
    "gantt-core",
    L.isDragging && "gantt-core--dragging"
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ G("div", { className: $t, style: yt, children: [
    /* @__PURE__ */ h(
      Bt,
      {
        columns: m,
        columnWidth: c,
        height: Yt,
        scrollLeft: f,
        taskListWidth: a
      }
    ),
    /* @__PURE__ */ h("div", { className: "gantt-body", children: /* @__PURE__ */ h(
      "div",
      {
        ref: v,
        className: "gantt-timeline-container",
        onScroll: M,
        children: /* @__PURE__ */ G("div", { className: "gantt-body-inner", style: { width: a + g }, children: [
          /* @__PURE__ */ h(
            jt,
            {
              rows: R,
              width: a,
              rowHeight: o,
              totalHeight: I,
              onToggleCollapse: P
            }
          ),
          /* @__PURE__ */ G(
            "svg",
            {
              ref: T,
              className: `gantt-svg${l ? "" : " gantt-svg--interactive"}`,
              width: g,
              height: C,
              onPointerMove: L.handlePointerMove,
              onPointerUp: L.handlePointerUp,
              children: [
                /* @__PURE__ */ G("g", { className: "gantt-grid-layer", children: [
                  m.filter((u) => u.isWeekend).map((u) => /* @__PURE__ */ h(
                    "rect",
                    {
                      className: "gantt-weekend-rect",
                      x: u.x,
                      y: 0,
                      width: c,
                      height: I
                    },
                    `weekend-${u.index}`
                  )),
                  m.map((u) => /* @__PURE__ */ h(
                    "line",
                    {
                      className: "gantt-grid-line",
                      x1: u.x,
                      y1: 0,
                      x2: u.x,
                      y2: I
                    },
                    `line-${u.index}`
                  )),
                  R.map((u) => /* @__PURE__ */ h(
                    "line",
                    {
                      className: "gantt-grid-line",
                      x1: 0,
                      y1: u.y + u.height,
                      x2: g,
                      y2: u.y + u.height
                    },
                    `hline-${u.id}`
                  )),
                  R.filter((u) => u.type === "group").map((u) => /* @__PURE__ */ h(
                    "rect",
                    {
                      className: "gantt-group-row",
                      x: 0,
                      y: u.y,
                      width: g,
                      height: u.height
                    },
                    `group-bg-${u.id}`
                  ))
                ] }),
                d && /* @__PURE__ */ h(
                  Jt,
                  {
                    dependencies: s,
                    bars: p,
                    rowHeight: o
                  }
                ),
                /* @__PURE__ */ h("g", { className: "gantt-bars-layer", children: p.map((u) => /* @__PURE__ */ h(
                  Ft,
                  {
                    bar: u,
                    readOnly: l,
                    disabled: $.has(u.taskId),
                    onClick: F,
                    onDoubleClick: S,
                    onMoveStart: L.handleMoveStart,
                    onResizeLeftStart: L.handleResizeLeftStart,
                    onResizeRightStart: L.handleResizeRightStart,
                    onProgressStart: L.handleProgressStart,
                    didDrag: L.didDrag,
                    clearDidDrag: L.clearDidDrag
                  },
                  u.taskId
                )) }),
                /* @__PURE__ */ h("g", { className: "gantt-ghost-layer", children: /* @__PURE__ */ h(
                  "rect",
                  {
                    ref: W,
                    className: "gantt-bar-ghost",
                    rx: 4,
                    ry: 4,
                    style: { display: "none" }
                  }
                ) }),
                mt && /* @__PURE__ */ h("g", { className: "gantt-today-layer", children: /* @__PURE__ */ h(
                  "line",
                  {
                    className: "gantt-today-line",
                    x1: J,
                    y1: 0,
                    x2: J,
                    y2: I
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
function ct(t) {
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
function V(t) {
  return Math.max(0, Math.min(255, Math.round(t)));
}
function re(t, e = 40) {
  const [s, r, n] = ct(t);
  return `#${V(s - e).toString(16).padStart(2, "0")}${V(r - e).toString(16).padStart(2, "0")}${V(n - e).toString(16).padStart(2, "0")}`;
}
function ae(t, e = 40) {
  const [s, r, n] = ct(t);
  return `#${V(s + e).toString(16).padStart(2, "0")}${V(r + e).toString(16).padStart(2, "0")}${V(n + e).toString(16).padStart(2, "0")}`;
}
function oe(t, e) {
  const [s, r, n] = ct(t);
  return `rgba(${s}, ${r}, ${n}, ${e})`;
}
export {
  se as GanttChart,
  bt as computeArrowPath,
  re as darkenHex,
  oe as hexToRgba,
  ae as lightenHex,
  Pt as useGanttTree
};
