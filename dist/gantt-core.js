import { jsxs as b, jsx as h, Fragment as kt } from "react/jsx-runtime";
import { useMemo as rt, useState as at, useCallback as B, useRef as Z } from "react";
function z(t) {
  const e = new Date(t);
  return e.setHours(0, 0, 0, 0), e;
}
function Y(t) {
  const e = z(t), r = e.getDay(), a = r === 0 ? 6 : r - 1;
  return e.setDate(e.getDate() - a), e;
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
  const r = new Date(t);
  return r.setDate(r.getDate() + e), r;
}
function ot(t, e) {
  const r = new Date(t);
  return r.setMonth(r.getMonth() + e), r;
}
function It(t, e = "week") {
  if (t.length === 0) {
    const d = /* @__PURE__ */ new Date();
    return { start: Q(d, -14), end: Q(d, 14) };
  }
  let r = t[0].start.getTime(), a = t[0].end.getTime();
  for (const d of t)
    d.start.getTime() < r && (r = d.start.getTime()), d.end.getTime() > a && (a = d.end.getTime());
  const s = e === "month" ? 30 : 7, o = Q(new Date(r), -s), n = Q(new Date(a), s), i = e === "month" ? tt(o) : e === "week" ? Y(o) : z(o), l = e === "month" ? tt(ot(n, 1)) : e === "week" ? Q(Y(n), 7) : Q(z(n), 1);
  return { start: i, end: l };
}
function q(t, e, r, a) {
  if (a === "month") {
    const n = Tt(e.start, t), i = it(t), d = (t.getDate() - 1) / i;
    return (Math.floor(n) + d) * r;
  }
  return wt(e.start, t) / (a === "week" ? 7 : 1) * r;
}
function et(t, e, r, a) {
  if (a === "month") {
    const n = t / r, i = Math.floor(n), l = n - i, d = ot(e.start, i), y = it(d);
    return Q(d, Math.round(l * y));
  }
  const s = a === "week" ? 7 : 1, o = t / r * s;
  return Q(e.start, Math.round(o));
}
function Lt(t, e, r, a) {
  const s = [];
  if (r === "month") {
    let l = tt(t.start), d = 0;
    for (; l.getTime() < t.end.getTime(); )
      s.push({
        index: d,
        date: new Date(l),
        label: Mt(l, a),
        x: d * e,
        isWeekend: !1
      }), l = ot(l, 1), d++;
    return s;
  }
  const o = r === "week" ? 7 : 1;
  let n = r === "week" ? Y(t.start) : z(t.start), i = 0;
  for (; n.getTime() < t.end.getTime(); ) {
    const l = n.getDay();
    s.push({
      index: i,
      date: new Date(n),
      label: r === "week" ? St(n, a) : Nt(n, a),
      x: i * e,
      isWeekend: l === 0 || l === 6
    }), n = Q(n, o), i++;
  }
  return s;
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
function Tt(t, e) {
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
function At(t, e, r, a, s, o, n) {
  return rt(() => {
    const i = It(t, r), l = Lt(i, s, r, n), d = /* @__PURE__ */ new Map();
    for (const c of e)
      d.set(c.id, c.color);
    const y = /* @__PURE__ */ new Map(), $ = /* @__PURE__ */ new Map();
    for (const c of t)
      if (y.set(c.id, c), c.parentId) {
        const D = $.get(c.parentId) ?? [];
        D.push(c), $.set(c.parentId, D);
      }
    const v = [...e].sort(
      (c, D) => (c.sortOrder ?? 0) - (D.sortOrder ?? 0)
    ), N = [], w = [], S = a * Ct;
    function O(c, D, P) {
      const C = [...c].sort(
        (f, M) => (f.sortOrder ?? 0) - (M.sortOrder ?? 0)
      );
      for (const f of C) {
        const M = N.length * a, E = $.get(f.id), R = !!E && E.length > 0, p = o.has(f.id);
        N.push({
          type: "task",
          id: `task-${f.id}`,
          y: M,
          height: a,
          groupId: D,
          taskId: f.id,
          level: P,
          name: f.name,
          color: f.color ?? d.get(D),
          hasChildren: R,
          isCollapsed: p
        });
        const m = f.color ?? d.get(D) ?? vt, x = f.start.getTime() === f.end.getTime(), g = f.severity ?? (f.critical ? "critical" : void 0), I = g === "critical";
        if (x) {
          const A = q(f.start, i, s, r);
          w.push({
            taskId: f.id,
            x: A - S / 2,
            y: M + (a - S) / 2,
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
          const A = q(f.start, i, s, r), F = q(f.end, i, s, r), L = Math.max(F - A, 2);
          w.push({
            taskId: f.id,
            x: A,
            y: M + (a - S) / 2,
            width: L,
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
        E && !p && O(E, D, P + 1);
      }
    }
    if (v.length > 0)
      for (const c of v) {
        const D = t.filter(
          (M) => M.groupId === c.id && !M.parentId
        ), P = D.length > 0, C = o.has(c.id), f = N.length * a;
        if (N.push({
          type: "group",
          id: `group-${c.id}`,
          y: f,
          height: a,
          groupId: c.id,
          level: 0,
          name: c.name,
          color: c.color,
          hasChildren: P,
          isCollapsed: C
        }), !C)
          O(D, c.id, 1);
        else if (P) {
          const M = t.filter((g) => g.groupId === c.id);
          let E = M[0].start, R = M[0].end;
          for (const g of M)
            g.start < E && (E = g.start), g.end > R && (R = g.end);
          const p = q(E, i, s, r), m = q(R, i, s, r), x = Math.max(m - p, 2);
          w.push({
            taskId: `group-summary-${c.id}`,
            x: p,
            y: f + (a - S) / 2,
            width: x,
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
      const c = t.filter((D) => !D.parentId);
      O(c, "", 1);
    }
    const G = l.length > 0 ? l[l.length - 1].x + s : 0, j = N.length * a;
    return { rows: N, bars: w, columns: l, timeRange: i, totalWidth: G, totalHeight: j };
  }, [t, e, r, a, s, o, n]);
}
function Pt(t) {
  const [e, r] = at(
    () => new Set(t)
  ), a = B((o) => {
    r((n) => {
      const i = new Set(n);
      return i.has(o) ? i.delete(o) : i.add(o), i;
    });
  }, []), s = B(
    (o) => e.has(o),
    [e]
  );
  return { collapsedIds: e, toggleCollapse: a, isCollapsed: s };
}
function Et() {
  const t = Z(null), [e, r] = at(0), a = B(() => {
    t.current && r(t.current.scrollLeft);
  }, []);
  return { containerRef: t, scrollLeft: e, handleScroll: a };
}
const Ht = 3, K = 10;
function Ot(t) {
  const {
    svgRef: e,
    ghostRectRef: r,
    bars: a,
    timeRange: s,
    columnWidth: o,
    viewMode: n,
    readOnly: i = !1,
    disabledTaskIds: l,
    onTaskMove: d,
    onTaskResize: y,
    onProgressChange: $
  } = t, [v, N] = at(!1), w = Z(null), S = Z(null), O = Z(!1), G = B(
    (p) => a.find((m) => m.taskId === p),
    [a]
  ), j = B(
    (p) => {
      var x;
      const m = ((x = e.current) == null ? void 0 : x.getBoundingClientRect().left) ?? 0;
      return p - m;
    },
    [e]
  ), c = B(
    (p, m, x) => {
      if (i || l != null && l.has(p)) return;
      const g = G(p);
      g && (x.target.setPointerCapture(x.pointerId), x.preventDefault(), S.current = {
        startClientX: x.clientX,
        originalBar: { ...g },
        mode: m,
        taskId: p,
        activated: !1
      }, O.current = !1);
    },
    [i, l, G]
  ), D = B(
    (p) => {
      const m = S.current;
      if (!m) return;
      const x = p.clientX - m.startClientX, { originalBar: g, mode: I, taskId: A } = m;
      if (!m.activated) {
        if (Math.abs(x) < Ht) return;
        if (m.activated = !0, O.current = !0, N(!0), w.current = {
          taskId: A,
          mode: I,
          originalBar: g,
          ghostBar: { ...g },
          ghostProgress: g.progress
        }, I !== "progress" && r.current) {
          const k = r.current;
          k.style.display = "", k.setAttribute("x", String(g.x)), k.setAttribute("y", String(g.y)), k.setAttribute("width", String(g.width)), k.setAttribute("height", String(g.height)), k.setAttribute("fill", g.color);
        }
      }
      const F = w.current;
      if (!F) return;
      const L = { ...F.originalBar };
      let W = F.originalBar.progress;
      switch (I) {
        case "move":
          L.x = g.x + x;
          break;
        case "resize-left": {
          const k = g.x + x, T = g.width - x;
          T >= K ? (L.x = k, L.width = T) : (L.x = g.x + g.width - K, L.width = K);
          break;
        }
        case "resize-right": {
          const k = g.width + x;
          L.width = Math.max(k, K);
          break;
        }
        case "progress": {
          const U = (j(p.clientX) - g.x) / g.width * 100;
          W = Math.round(Math.max(0, Math.min(100, U)));
          break;
        }
      }
      if (w.current = { ...F, ghostBar: L, ghostProgress: W }, I !== "progress" && r.current) {
        const k = r.current;
        k.setAttribute("x", String(L.x)), k.setAttribute("y", String(L.y)), k.setAttribute("width", String(L.width)), k.setAttribute("height", String(L.height));
      }
      if (I === "progress" && e.current) {
        const k = e.current.querySelector(
          `[data-progress-task="${A}"]`
        ), T = e.current.querySelector(
          `[data-progress-handle="${A}"]`
        ), U = g.width * (W / 100);
        if (k) {
          const J = g.width - U;
          k.setAttribute(
            "clip-path",
            `inset(0 ${J}px 0 0)`
          ), k.style.display = W > 0 ? "" : "none";
        }
        T && T.setAttribute(
          "cx",
          String(g.x + U)
        );
      }
    },
    [j, r, e]
  ), P = B(
    (p) => {
      const m = S.current;
      if (!m || (p.target.releasePointerCapture(p.pointerId), S.current = null, !m.activated))
        return;
      const x = w.current;
      if (w.current = null, r.current && (r.current.style.display = "none"), N(!1), !x) return;
      const { mode: g, taskId: I, ghostBar: A, ghostProgress: F } = x;
      queueMicrotask(() => {
        if (g === "progress") {
          $ == null || $({ taskId: I, progress: F });
          return;
        }
        if (x.originalBar.kind === "milestone") {
          const k = A.x + A.width / 2, T = nt(
            et(k, s, o, n),
            n
          );
          d == null || d({ taskId: I, start: T, end: T });
          return;
        }
        const L = nt(
          et(A.x, s, o, n),
          n
        ), W = nt(
          et(A.x + A.width, s, o, n),
          n
        );
        g === "move" ? d == null || d({ taskId: I, start: L, end: W }) : y == null || y({ taskId: I, start: L, end: W });
      });
    },
    [s, o, n, d, y, $, r]
  ), C = B(
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
    isDragging: v,
    didDrag: O.current,
    clearDidDrag: R,
    handleMoveStart: C,
    handleResizeLeftStart: f,
    handleResizeRightStart: M,
    handleProgressStart: E,
    handlePointerMove: D,
    handlePointerUp: P
  };
}
function Bt({
  columns: t,
  columnWidth: e,
  height: r,
  scrollLeft: a,
  taskListWidth: s
}) {
  return /* @__PURE__ */ b("div", { className: "gantt-header", style: { height: r }, children: [
    s > 0 && /* @__PURE__ */ h(
      "div",
      {
        className: "gantt-header-cell gantt-header-cell--task-list",
        style: { width: s, height: r },
        children: "Tasks"
      }
    ),
    /* @__PURE__ */ h("div", { className: "gantt-header-dates", style: { overflow: "hidden", flex: 1 }, children: /* @__PURE__ */ h(
      "div",
      {
        style: {
          display: "flex",
          transform: `translateX(-${a}px)`
        },
        children: t.map((o) => /* @__PURE__ */ h(
          "div",
          {
            className: "gantt-header-cell",
            style: { width: e, height: r },
            children: o.label
          },
          o.index
        ))
      }
    ) })
  ] });
}
const _t = 60, st = 8, Rt = 5, lt = 4, X = 6;
function dt(t, e) {
  const r = t.x + X, a = t.x + t.width - X, s = t.y + X, o = t.y + t.height - X;
  switch (e.position) {
    case "top-left":
      return { cx: r, cy: s };
    case "bottom-right":
      return { cx: a, cy: o };
    case "bottom-left":
      return { cx: r, cy: o };
    case "top-right":
    default:
      return { cx: a, cy: s };
  }
}
function Ft({
  bar: t,
  readOnly: e,
  disabled: r,
  onClick: a,
  onDoubleClick: s,
  onMoveStart: o,
  onResizeLeftStart: n,
  onResizeRightStart: i,
  onProgressStart: l,
  didDrag: d,
  clearDidDrag: y
}) {
  const v = !e && !r && !t.isSummary, N = (c) => {
    if (d) {
      y == null || y(), c.stopPropagation();
      return;
    }
    a == null || a(t.taskId);
  }, w = () => {
    d || s == null || s(t.taskId);
  }, S = t.severity === "warning" ? "gantt-bar-group--warning" : t.severity === "critical" || t.critical ? "gantt-bar-group--critical" : null, O = [
    "gantt-bar-group",
    v && "gantt-bar-group--interactive",
    r && "gantt-bar-group--disabled",
    t.isSummary && "gantt-bar-group--summary",
    S,
    t.kind === "milestone" && "gantt-bar-group--milestone"
  ].filter(Boolean).join(" "), G = t.indicators ?? [];
  if (t.kind === "milestone") {
    const c = t.x + t.width / 2, D = t.y + t.height / 2, P = [
      `${c},${t.y}`,
      `${t.x + t.width},${D}`,
      `${c},${t.y + t.height}`,
      `${t.x},${D}`
    ].join(" ");
    return /* @__PURE__ */ b(
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
              onPointerDown: v ? (C) => o == null ? void 0 : o(t.taskId, C) : void 0
            }
          ),
          /* @__PURE__ */ h(
            "text",
            {
              className: "gantt-milestone-label",
              x: t.x + t.width + 6,
              y: D,
              children: t.name
            }
          ),
          G.map((C, f) => {
            const { cx: M, cy: E } = dt(t, C);
            return /* @__PURE__ */ h(
              "circle",
              {
                className: "gantt-bar-indicator",
                cx: M,
                cy: E,
                r: lt,
                fill: C.color,
                children: C.label && /* @__PURE__ */ h("title", { children: C.label })
              },
              `ind-${f}`
            );
          })
        ]
      }
    );
  }
  const j = t.width * (t.progress / 100);
  return /* @__PURE__ */ b(
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
            onPointerDown: v ? (c) => o == null ? void 0 : o(t.taskId, c) : void 0
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
            clipPath: `inset(0 ${t.width - j}px 0 0)`
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
        v && /* @__PURE__ */ b(kt, { children: [
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
                c.stopPropagation(), n == null || n(t.taskId, c);
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
              cx: t.x + j,
              cy: t.y + t.height / 2,
              r: Rt,
              onPointerDown: (c) => {
                c.stopPropagation(), l == null || l(t.taskId, c);
              }
            }
          )
        ] }),
        G.map((c, D) => {
          const { cx: P, cy: C } = dt(t, c);
          return /* @__PURE__ */ h(
            "circle",
            {
              className: "gantt-bar-indicator",
              cx: P,
              cy: C,
              r: lt,
              fill: c.color,
              children: c.label && /* @__PURE__ */ h("title", { children: c.label })
            },
            `ind-${D}`
          );
        })
      ]
    }
  );
}
const Wt = 16;
function bt({ expanded: t }) {
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
function Gt({
  rows: t,
  width: e,
  rowHeight: r,
  totalHeight: a,
  onToggleCollapse: s,
  onTaskClick: o
}) {
  return e <= 0 ? null : /* @__PURE__ */ h(
    "div",
    {
      className: "gantt-task-list",
      style: { width: e, minHeight: a },
      role: "list",
      children: t.map((n) => {
        const i = n.type === "group" ? n.groupId : n.taskId, l = n.level * Wt, d = n.type === "task", y = n.hasChildren || d && !!o, $ = y ? () => {
          d && o ? o(i) : n.hasChildren && s(i);
        } : void 0;
        return /* @__PURE__ */ b(
          "div",
          {
            className: `gantt-task-list-row ${n.type === "group" ? "gantt-task-list-row--group" : ""}`,
            style: { height: r, cursor: y ? "pointer" : void 0 },
            role: y ? "button" : "listitem",
            "aria-expanded": n.hasChildren ? !n.isCollapsed : void 0,
            "aria-label": n.hasChildren ? n.isCollapsed ? `Expand ${n.name}` : `Collapse ${n.name}` : void 0,
            onClick: $,
            children: [
              n.type === "group" && n.color && /* @__PURE__ */ h(
                "div",
                {
                  className: "gantt-task-list-accent",
                  style: { backgroundColor: n.color }
                }
              ),
              /* @__PURE__ */ h("div", { style: { width: l, flexShrink: 0 } }),
              n.hasChildren ? /* @__PURE__ */ h(
                "span",
                {
                  className: "gantt-task-list-toggle",
                  role: d ? "button" : void 0,
                  "aria-label": d ? n.isCollapsed ? `Expand ${n.name}` : `Collapse ${n.name}` : void 0,
                  onClick: d ? (v) => {
                    v.stopPropagation(), s(i);
                  } : void 0,
                  children: /* @__PURE__ */ h(bt, { expanded: !n.isCollapsed })
                }
              ) : /* @__PURE__ */ h("div", { className: "gantt-task-list-toggle-spacer" }),
              /* @__PURE__ */ h("span", { className: "gantt-task-list-name", title: n.name, children: n.name })
            ]
          },
          n.id
        );
      })
    }
  );
}
const _ = 5, H = 12;
function jt(t, e = 4) {
  const r = t.sourceLeft + t.sourceWidth, a = t.targetLeft + t.targetWidth, s = t.sourceTop + t.sourceHeight / 2, o = t.targetTop + t.targetHeight / 2;
  switch (t.type) {
    case "FS":
      return Qt(t, r, s, o, e);
    case "SS":
      return Ut(t, s, o, e);
    case "FF":
      return zt(r, a, s, o, e);
    case "SF":
      return qt(t, a, s, o, e);
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
function Qt(t, e, r, a, s) {
  const o = ht(t.targetLeft, a), n = t.targetLeft - _;
  if (t.targetLeft - e > H * 2)
    return Zt(e, r, n, a, e + H, s, o);
  const i = ut(t);
  return pt(
    e,
    r,
    "right",
    n,
    a,
    "left",
    e + H,
    t.targetLeft - H,
    i,
    s,
    o
  );
}
function Ut(t, e, r, a) {
  const s = ht(t.targetLeft, r), o = t.targetLeft - _, n = Math.min(t.sourceLeft, t.targetLeft) - H;
  return ft(
    t.sourceLeft,
    e,
    "left",
    o,
    r,
    "right",
    n,
    a,
    s
  );
}
function zt(t, e, r, a, s) {
  const o = gt(e, a), n = e + _, i = Math.max(t, e) + H;
  return ft(
    t,
    r,
    "right",
    n,
    a,
    "left",
    i,
    s,
    o
  );
}
function qt(t, e, r, a, s) {
  const o = gt(e, a), n = e + _;
  if (t.sourceLeft - e > H * 2)
    return Vt(t.sourceLeft, r, n, a, t.sourceLeft - H, s, o);
  const i = ut(t);
  return pt(
    t.sourceLeft,
    r,
    "left",
    n,
    a,
    "right",
    t.sourceLeft - H,
    e + H,
    i,
    s,
    o
  );
}
function ut(t) {
  const e = t.sourceTop + t.sourceHeight, r = t.targetTop + t.targetHeight;
  return Math.max(e, r) + t.rowHeight * 0.4;
}
function Zt(t, e, r, a, s, o, n) {
  const i = a - e;
  if (Math.abs(i) < 1)
    return { path: `M ${t},${e} L ${r},${a}`, arrowHead: n };
  const l = Math.min(o, Math.abs(i) / 2, H / 2), d = i > 0 ? 1 : -1;
  return { path: [
    `M ${t},${e}`,
    `L ${s - l},${e}`,
    `Q ${s},${e} ${s},${e + l * d}`,
    `L ${s},${a - l * d}`,
    `Q ${s},${a} ${s + l},${a}`,
    `L ${r},${a}`
  ].join(" "), arrowHead: n };
}
function Vt(t, e, r, a, s, o, n) {
  const i = a - e;
  if (Math.abs(i) < 1)
    return { path: `M ${t},${e} L ${r},${a}`, arrowHead: n };
  const l = Math.min(o, Math.abs(i) / 2, H / 2), d = i > 0 ? 1 : -1;
  return { path: [
    `M ${t},${e}`,
    `L ${s + l},${e}`,
    `Q ${s},${e} ${s},${e + l * d}`,
    `L ${s},${a - l * d}`,
    `Q ${s},${a} ${s - l},${a}`,
    `L ${r},${a}`
  ].join(" "), arrowHead: n };
}
function ft(t, e, r, a, s, o, n, i, l) {
  const d = s - e, y = Math.min(i, Math.max(Math.abs(d) / 2, 1), H / 2), $ = d >= 0 ? 1 : -1, v = r === "left" ? -1 : 1, N = o === "left" ? 1 : -1;
  return { path: [
    `M ${t},${e}`,
    // Horizontal from start toward the column (stop short to leave room for curve)
    `L ${n - v * y},${e}`,
    // Curve into vertical
    `Q ${n},${e} ${n},${e + y * $}`,
    // Vertical segment to target row
    `L ${n},${s - y * $}`,
    // Curve out of vertical
    `Q ${n},${s} ${n + N * y},${s}`,
    // Horizontal to end
    `L ${a},${s}`
  ].join(" "), arrowHead: l };
}
function pt(t, e, r, a, s, o, n, i, l, d, y) {
  const $ = Math.min(d, H / 2), v = r === "left" ? -1 : 1, N = o === "left" ? 1 : -1, w = i > n ? 1 : -1;
  return { path: [
    `M ${t},${e}`,
    // Horizontal from source anchor to startColX
    `L ${n - v * $},${e}`,
    // Curve into vertical (going down toward detour)
    `Q ${n},${e} ${n},${e + $}`,
    // Vertical down to detour row
    `L ${n},${l - $}`,
    // Curve into horizontal toward endColX
    `Q ${n},${l} ${n + w * $},${l}`,
    // Horizontal across detour row
    `L ${i - w * $},${l}`,
    // Curve into vertical (going up toward target row)
    `Q ${i},${l} ${i},${l - $}`,
    // Vertical up to target row
    `L ${i},${s + $}`,
    // Curve into horizontal toward target anchor
    `Q ${i},${s} ${i + N * $},${s}`,
    // Final horizontal to arrowhead
    `L ${a},${s}`
  ].join(" "), arrowHead: y };
}
function Jt({ dependencies: t, bars: e, rowHeight: r }) {
  const a = rt(() => {
    const s = /* @__PURE__ */ new Map();
    for (const n of e)
      s.set(n.taskId, n);
    const o = [];
    for (const n of t) {
      const i = s.get(n.fromTaskId), l = s.get(n.toTaskId);
      if (!i || !l) continue;
      const d = jt({
        sourceLeft: i.x,
        sourceTop: i.y,
        sourceWidth: i.width,
        sourceHeight: i.height,
        targetLeft: l.x,
        targetTop: l.y,
        targetWidth: l.width,
        targetHeight: l.height,
        rowHeight: r,
        type: n.type
      });
      o.push({
        key: `${n.fromTaskId}->${n.toTaskId}:${n.type}`,
        path: d.path,
        arrowHead: d.arrowHead
      });
    }
    return o;
  }, [t, e, r]);
  return a.length === 0 ? null : /* @__PURE__ */ h("g", { className: "gantt-dependencies-layer", children: a.map((s) => /* @__PURE__ */ b("g", { children: [
    /* @__PURE__ */ h("path", { className: "gantt-arrow-path", d: s.path }),
    /* @__PURE__ */ h("polygon", { className: "gantt-arrow-head", points: s.arrowHead })
  ] }, s.key)) });
}
const Kt = {
  day: 50,
  week: 80,
  month: 120
}, Xt = 50, Yt = 40, te = 0.8;
function se(t) {
  const {
    tasks: e,
    dependencies: r = [],
    groups: a = [],
    viewMode: s = "week",
    taskListWidth: o = 0,
    rowHeight: n = Xt,
    columnWidth: i,
    readOnly: l = !1,
    showDependencies: d = !0,
    showTodayMarker: y = !0,
    theme: $,
    locale: v,
    initialCollapsed: N,
    onTaskClick: w,
    onTaskDoubleClick: S,
    onTaskMove: O,
    onTaskResize: G,
    onProgressChange: j
  } = t, c = i ?? Kt[s], { collapsedIds: D, toggleCollapse: P } = Pt(N), { containerRef: C, scrollLeft: f, handleScroll: M } = Et(), E = At(
    e,
    a,
    s,
    n,
    c,
    D,
    v
  ), { rows: R, bars: p, columns: m, timeRange: x, totalWidth: g, totalHeight: I } = E, A = I + n * te, F = (u) => {
    if (u.startsWith("group-summary-")) {
      const xt = u.replace("group-summary-", "");
      P(xt);
    } else
      w == null || w(u);
  }, L = Z(null), W = Z(null), k = rt(
    () => new Set(e.filter((u) => u.disabled).map((u) => u.id)),
    [e]
  ), T = Ot({
    svgRef: L,
    ghostRectRef: W,
    bars: p,
    timeRange: x,
    columnWidth: c,
    viewMode: s,
    readOnly: l,
    disabledTaskIds: k,
    onTaskMove: O,
    onTaskResize: G,
    onProgressChange: j
  }), U = /* @__PURE__ */ new Date(), J = q(U, x, c, s), mt = y && U >= x.start && U <= x.end, yt = $ ? Object.fromEntries(
    Object.entries($).filter(([, u]) => u !== void 0)
  ) : {}, $t = [
    "gantt-core",
    T.isDragging && "gantt-core--dragging"
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ b("div", { className: $t, style: yt, children: [
    /* @__PURE__ */ h(
      Bt,
      {
        columns: m,
        columnWidth: c,
        height: Yt,
        scrollLeft: f,
        taskListWidth: o
      }
    ),
    /* @__PURE__ */ h("div", { className: "gantt-body", children: /* @__PURE__ */ h(
      "div",
      {
        ref: C,
        className: "gantt-timeline-container",
        onScroll: M,
        children: /* @__PURE__ */ b("div", { className: "gantt-body-inner", style: { width: o + g }, children: [
          /* @__PURE__ */ h(
            Gt,
            {
              rows: R,
              width: o,
              rowHeight: n,
              totalHeight: I,
              onToggleCollapse: P,
              onTaskClick: w
            }
          ),
          /* @__PURE__ */ b(
            "svg",
            {
              ref: L,
              className: `gantt-svg${l ? "" : " gantt-svg--interactive"}`,
              width: g,
              height: A,
              onPointerMove: T.handlePointerMove,
              onPointerUp: T.handlePointerUp,
              children: [
                /* @__PURE__ */ b("g", { className: "gantt-grid-layer", children: [
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
                    dependencies: r,
                    bars: p,
                    rowHeight: n
                  }
                ),
                /* @__PURE__ */ h("g", { className: "gantt-bars-layer", children: p.map((u) => /* @__PURE__ */ h(
                  Ft,
                  {
                    bar: u,
                    readOnly: l,
                    disabled: k.has(u.taskId),
                    onClick: F,
                    onDoubleClick: S,
                    onMoveStart: T.handleMoveStart,
                    onResizeLeftStart: T.handleResizeLeftStart,
                    onResizeRightStart: T.handleResizeRightStart,
                    onProgressStart: T.handleProgressStart,
                    didDrag: T.didDrag,
                    clearDidDrag: T.clearDidDrag
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
  const [r, a, s] = ct(t);
  return `#${V(r - e).toString(16).padStart(2, "0")}${V(a - e).toString(16).padStart(2, "0")}${V(s - e).toString(16).padStart(2, "0")}`;
}
function ae(t, e = 40) {
  const [r, a, s] = ct(t);
  return `#${V(r + e).toString(16).padStart(2, "0")}${V(a + e).toString(16).padStart(2, "0")}${V(s + e).toString(16).padStart(2, "0")}`;
}
function oe(t, e) {
  const [r, a, s] = ct(t);
  return `rgba(${r}, ${a}, ${s}, ${e})`;
}
export {
  se as GanttChart,
  jt as computeArrowPath,
  re as darkenHex,
  oe as hexToRgba,
  ae as lightenHex,
  Pt as useGanttTree
};
