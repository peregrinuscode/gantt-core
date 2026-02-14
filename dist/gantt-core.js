import { jsxs as _, jsx as h, Fragment as dt } from "react/jsx-runtime";
import { useMemo as et, useState as nt, useCallback as C, useRef as U } from "react";
function W(t) {
  const e = new Date(t);
  return e.setHours(0, 0, 0, 0), e;
}
function J(t) {
  const e = W(t), n = e.getDay(), a = n === 0 ? 6 : n - 1;
  return e.setDate(e.getDate() - a), e;
}
function K(t) {
  const e = W(t);
  return e.setDate(1), e;
}
const gt = 864e5;
function ht(t, e) {
  return (W(e).getTime() - W(t).getTime()) / gt;
}
function O(t, e) {
  const n = new Date(t);
  return n.setDate(n.getDate() + e), n;
}
function rt(t, e) {
  const n = new Date(t);
  return n.setMonth(n.getMonth() + e), n;
}
function ut(t, e = "week") {
  if (t.length === 0) {
    const l = /* @__PURE__ */ new Date();
    return { start: O(l, -14), end: O(l, 14) };
  }
  let n = t[0].start.getTime(), a = t[0].end.getTime();
  for (const l of t)
    l.start.getTime() < n && (n = l.start.getTime()), l.end.getTime() > a && (a = l.end.getTime());
  const r = e === "month" ? 30 : 7, s = O(new Date(n), -r), i = O(new Date(a), r), o = e === "month" ? K(s) : e === "week" ? J(s) : W(s), c = e === "month" ? K(rt(i, 1)) : e === "week" ? O(J(i), 7) : O(W(i), 1);
  return { start: o, end: c };
}
function q(t, e, n, a) {
  if (a === "month") {
    const i = pt(e.start, t), o = st(t), l = (t.getDate() - 1) / o;
    return (Math.floor(i) + l) * n;
  }
  return ht(e.start, t) / (a === "week" ? 7 : 1) * n;
}
function ot(t, e, n, a) {
  if (a === "month") {
    const i = t / n, o = Math.floor(i), c = i - o, l = rt(e.start, o), m = st(l);
    return O(l, Math.round(c * m));
  }
  const r = a === "week" ? 7 : 1, s = t / n * r;
  return O(e.start, Math.round(s));
}
function ft(t, e, n, a) {
  const r = [];
  if (n === "month") {
    let c = K(t.start), l = 0;
    for (; c.getTime() < t.end.getTime(); )
      r.push({
        index: l,
        date: new Date(c),
        label: xt(c, a),
        x: l * e,
        isWeekend: !1
      }), c = rt(c, 1), l++;
    return r;
  }
  const s = n === "week" ? 7 : 1;
  let i = n === "week" ? J(t.start) : W(t.start), o = 0;
  for (; i.getTime() < t.end.getTime(); ) {
    const c = i.getDay();
    r.push({
      index: o,
      date: new Date(i),
      label: n === "week" ? yt(i, a) : mt(i, a),
      x: o * e,
      isWeekend: c === 0 || c === 6
    }), i = O(i, s), o++;
  }
  return r;
}
function it(t, e) {
  switch (e) {
    case "day":
      return W(t);
    case "week":
      return J(t);
    case "month":
      return K(t);
  }
}
function pt(t, e) {
  return (e.getFullYear() - t.getFullYear()) * 12 + (e.getMonth() - t.getMonth()) + (e.getDate() - t.getDate()) / st(t);
}
function st(t) {
  return new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
}
function mt(t, e) {
  return t.toLocaleDateString(e, { month: "short", day: "numeric" });
}
function yt(t, e) {
  return t.toLocaleDateString(e, { month: "short", day: "numeric" });
}
function xt(t, e) {
  return t.toLocaleDateString(e, { month: "short", year: "numeric" });
}
const $t = "#3f51b5", kt = 0.7;
function wt(t, e, n, a, r, s, i) {
  return et(() => {
    const o = ut(t, n), c = ft(o, r, n, i), l = /* @__PURE__ */ new Map();
    for (const g of e)
      l.set(g.id, g.color);
    const m = /* @__PURE__ */ new Map(), T = /* @__PURE__ */ new Map();
    for (const g of t)
      if (m.set(g.id, g), g.parentId) {
        const w = T.get(g.parentId) ?? [];
        w.push(g), T.set(g.parentId, w);
      }
    const B = [...e].sort(
      (g, w) => (g.sortOrder ?? 0) - (w.sortOrder ?? 0)
    ), D = [], v = [], L = a * kt;
    function Y(g, w, E) {
      const G = [...g].sort(
        ($, N) => ($.sortOrder ?? 0) - (N.sortOrder ?? 0)
      );
      for (const $ of G) {
        const N = D.length * a, M = T.get($.id), P = !!M && M.length > 0, p = s.has($.id);
        D.push({
          type: "task",
          id: `task-${$.id}`,
          y: N,
          height: a,
          groupId: w,
          taskId: $.id,
          level: E,
          name: $.name,
          color: $.color ?? l.get(w),
          hasChildren: P,
          isCollapsed: p
        });
        const f = q($.start, o, r, n), y = q($.end, o, r, n), d = Math.max(y - f, 2), X = $.color ?? l.get(w) ?? $t;
        v.push({
          taskId: $.id,
          x: f,
          y: N + (a - L) / 2,
          width: d,
          height: L,
          color: X,
          progress: $.progress,
          name: $.name
        }), M && !p && Y(M, w, E + 1);
      }
    }
    if (B.length > 0)
      for (const g of B) {
        const w = t.filter(
          (N) => N.groupId === g.id && !N.parentId
        ), E = w.length > 0, G = s.has(g.id), $ = D.length * a;
        if (D.push({
          type: "group",
          id: `group-${g.id}`,
          y: $,
          height: a,
          groupId: g.id,
          level: 0,
          name: g.name,
          color: g.color,
          hasChildren: E,
          isCollapsed: G
        }), !G)
          Y(w, g.id, 1);
        else if (E) {
          const N = t.filter((d) => d.groupId === g.id);
          let M = N[0].start, P = N[0].end;
          for (const d of N)
            d.start < M && (M = d.start), d.end > P && (P = d.end);
          const p = q(M, o, r, n), f = q(P, o, r, n), y = Math.max(f - p, 2);
          v.push({
            taskId: `group-summary-${g.id}`,
            x: p,
            y: $ + (a - L) / 2,
            width: y,
            height: L,
            color: g.color,
            progress: 0,
            name: g.name,
            isSummary: !0
          });
        }
      }
    else {
      const g = t.filter((w) => !w.parentId);
      Y(g, "", 1);
    }
    const k = c.length > 0 ? c[c.length - 1].x + r : 0, A = D.length * a;
    return { rows: D, bars: v, columns: c, timeRange: o, totalWidth: k, totalHeight: A };
  }, [t, e, n, a, r, s, i]);
}
function Dt(t) {
  const [e, n] = nt(
    () => new Set(t)
  ), a = C((s) => {
    n((i) => {
      const o = new Set(i);
      return o.has(s) ? o.delete(s) : o.add(s), o;
    });
  }, []), r = C(
    (s) => e.has(s),
    [e]
  );
  return { collapsedIds: e, toggleCollapse: a, isCollapsed: r };
}
function It() {
  const t = U(null), [e, n] = nt(0), a = C(() => {
    t.current && n(t.current.scrollLeft);
  }, []);
  return { containerRef: t, scrollLeft: e, handleScroll: a };
}
const St = 3, Z = 10;
function Nt(t) {
  const {
    svgRef: e,
    ghostRectRef: n,
    bars: a,
    timeRange: r,
    columnWidth: s,
    viewMode: i,
    readOnly: o = !1,
    disabledTaskIds: c,
    onTaskMove: l,
    onTaskResize: m,
    onProgressChange: T
  } = t, [B, D] = nt(!1), v = U(null), L = U(null), Y = U(!1), k = C(
    (p) => a.find((f) => f.taskId === p),
    [a]
  ), A = C(
    (p) => {
      var y;
      const f = ((y = e.current) == null ? void 0 : y.getBoundingClientRect().left) ?? 0;
      return p - f;
    },
    [e]
  ), g = C(
    (p, f, y) => {
      if (o || c != null && c.has(p)) return;
      const d = k(p);
      d && (y.target.setPointerCapture(y.pointerId), y.preventDefault(), L.current = {
        startClientX: y.clientX,
        originalBar: { ...d },
        mode: f,
        taskId: p,
        activated: !1
      }, Y.current = !1);
    },
    [o, c, k]
  ), w = C(
    (p) => {
      const f = L.current;
      if (!f) return;
      const y = p.clientX - f.startClientX, { originalBar: d, mode: X, taskId: R } = f;
      if (!f.activated) {
        if (Math.abs(y) < St) return;
        if (f.activated = !0, Y.current = !0, D(!0), v.current = {
          taskId: R,
          mode: X,
          originalBar: d,
          ghostBar: { ...d },
          ghostProgress: d.progress
        }, X !== "progress" && n.current) {
          const x = n.current;
          x.style.display = "", x.setAttribute("x", String(d.x)), x.setAttribute("y", String(d.y)), x.setAttribute("width", String(d.width)), x.setAttribute("height", String(d.height)), x.setAttribute("fill", d.color);
        }
      }
      const H = v.current;
      if (!H) return;
      const I = { ...H.originalBar };
      let S = H.originalBar.progress;
      switch (X) {
        case "move":
          I.x = d.x + y;
          break;
        case "resize-left": {
          const x = d.x + y, b = d.width - y;
          b >= Z ? (I.x = x, I.width = b) : (I.x = d.x + d.width - Z, I.width = Z);
          break;
        }
        case "resize-right": {
          const x = d.width + y;
          I.width = Math.max(x, Z);
          break;
        }
        case "progress": {
          const j = (A(p.clientX) - d.x) / d.width * 100;
          S = Math.round(Math.max(0, Math.min(100, j)));
          break;
        }
      }
      if (v.current = { ...H, ghostBar: I, ghostProgress: S }, X !== "progress" && n.current) {
        const x = n.current;
        x.setAttribute("x", String(I.x)), x.setAttribute("y", String(I.y)), x.setAttribute("width", String(I.width)), x.setAttribute("height", String(I.height));
      }
      if (X === "progress" && e.current) {
        const x = e.current.querySelector(
          `[data-progress-task="${R}"]`
        ), b = e.current.querySelector(
          `[data-progress-handle="${R}"]`
        ), j = d.width * (S / 100);
        if (x) {
          const V = d.width - j;
          x.setAttribute(
            "clip-path",
            `inset(0 ${V}px 0 0)`
          ), x.style.display = S > 0 ? "" : "none";
        }
        b && b.setAttribute(
          "cx",
          String(d.x + j)
        );
      }
    },
    [A, n, e]
  ), E = C(
    (p) => {
      const f = L.current;
      if (!f || (p.target.releasePointerCapture(p.pointerId), L.current = null, !f.activated))
        return;
      const y = v.current;
      if (v.current = null, n.current && (n.current.style.display = "none"), D(!1), !y) return;
      const { mode: d, taskId: X, ghostBar: R, ghostProgress: H } = y;
      queueMicrotask(() => {
        if (d === "progress")
          T == null || T({ taskId: X, progress: H });
        else {
          const I = it(
            ot(R.x, r, s, i),
            i
          ), S = it(
            ot(R.x + R.width, r, s, i),
            i
          );
          d === "move" ? l == null || l({ taskId: X, start: I, end: S }) : m == null || m({ taskId: X, start: I, end: S });
        }
      });
    },
    [r, s, i, l, m, T, n]
  ), G = C(
    (p, f) => g(p, "move", f),
    [g]
  ), $ = C(
    (p, f) => g(p, "resize-left", f),
    [g]
  ), N = C(
    (p, f) => g(p, "resize-right", f),
    [g]
  ), M = C(
    (p, f) => g(p, "progress", f),
    [g]
  ), P = C(() => {
    Y.current = !1;
  }, []);
  return {
    isDragging: B,
    didDrag: Y.current,
    clearDidDrag: P,
    handleMoveStart: G,
    handleResizeLeftStart: $,
    handleResizeRightStart: N,
    handleProgressStart: M,
    handlePointerMove: w,
    handlePointerUp: E
  };
}
function Tt({
  columns: t,
  columnWidth: e,
  height: n,
  scrollLeft: a,
  taskListWidth: r
}) {
  return /* @__PURE__ */ _("div", { className: "gantt-header", style: { height: n }, children: [
    r > 0 && /* @__PURE__ */ h(
      "div",
      {
        className: "gantt-header-cell gantt-header-cell--task-list",
        style: { width: r, height: n },
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
        children: t.map((s) => /* @__PURE__ */ h(
          "div",
          {
            className: "gantt-header-cell",
            style: { width: e, height: n },
            children: s.label
          },
          s.index
        ))
      }
    ) })
  ] });
}
const Mt = 60, tt = 8, vt = 5;
function Lt({
  bar: t,
  readOnly: e,
  disabled: n,
  onClick: a,
  onDoubleClick: r,
  onMoveStart: s,
  onResizeLeftStart: i,
  onResizeRightStart: o,
  onProgressStart: c,
  didDrag: l,
  clearDidDrag: m
}) {
  const B = t.width * (t.progress / 100), D = !e && !n && !t.isSummary, v = (k) => {
    if (l) {
      m == null || m(), k.stopPropagation();
      return;
    }
    a == null || a(t.taskId);
  }, L = () => {
    l || r == null || r(t.taskId);
  }, Y = [
    "gantt-bar-group",
    D && "gantt-bar-group--interactive",
    n && "gantt-bar-group--disabled",
    t.isSummary && "gantt-bar-group--summary"
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ _(
    "g",
    {
      className: Y,
      onClick: v,
      onDoubleClick: L,
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
            onPointerDown: D ? (k) => s == null ? void 0 : s(t.taskId, k) : void 0
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
            clipPath: `inset(0 ${t.width - B}px 0 0)`
          }
        ),
        t.width > Mt && /* @__PURE__ */ h(
          "text",
          {
            className: "gantt-bar-label",
            x: t.x + t.width / 2,
            y: t.y + t.height / 2,
            children: t.name
          }
        ),
        D && /* @__PURE__ */ _(dt, { children: [
          /* @__PURE__ */ h(
            "rect",
            {
              className: "gantt-bar-resize-handle",
              x: t.x,
              y: t.y,
              width: tt,
              height: t.height,
              rx: 4,
              ry: 4,
              onPointerDown: (k) => {
                k.stopPropagation(), i == null || i(t.taskId, k);
              }
            }
          ),
          /* @__PURE__ */ h(
            "rect",
            {
              className: "gantt-bar-resize-handle",
              x: t.x + t.width - tt,
              y: t.y,
              width: tt,
              height: t.height,
              rx: 4,
              ry: 4,
              onPointerDown: (k) => {
                k.stopPropagation(), o == null || o(t.taskId, k);
              }
            }
          ),
          /* @__PURE__ */ h(
            "circle",
            {
              className: "gantt-bar-progress-handle",
              "data-progress-handle": t.taskId,
              cx: t.x + B,
              cy: t.y + t.height / 2,
              r: vt,
              onPointerDown: (k) => {
                k.stopPropagation(), c == null || c(t.taskId, k);
              }
            }
          )
        ] })
      ]
    }
  );
}
const Xt = 16;
function Ct({ expanded: t }) {
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
function Yt({
  rows: t,
  width: e,
  rowHeight: n,
  totalHeight: a,
  onToggleCollapse: r
}) {
  return e <= 0 ? null : /* @__PURE__ */ h(
    "div",
    {
      className: "gantt-task-list",
      style: { width: e, minHeight: a },
      role: "list",
      children: t.map((s) => {
        const i = s.type === "group" ? s.groupId : s.taskId, o = s.level * Xt;
        return /* @__PURE__ */ _(
          "div",
          {
            className: `gantt-task-list-row ${s.type === "group" ? "gantt-task-list-row--group" : ""}`,
            style: { height: n },
            role: "listitem",
            children: [
              s.type === "group" && s.color && /* @__PURE__ */ h(
                "div",
                {
                  className: "gantt-task-list-accent",
                  style: { backgroundColor: s.color }
                }
              ),
              /* @__PURE__ */ h("div", { style: { width: o, flexShrink: 0 } }),
              s.hasChildren ? /* @__PURE__ */ h(
                "button",
                {
                  className: "gantt-task-list-toggle",
                  onClick: () => r(i),
                  "aria-label": s.isCollapsed ? `Expand ${s.name}` : `Collapse ${s.name}`,
                  "aria-expanded": !s.isCollapsed,
                  children: /* @__PURE__ */ h(Ct, { expanded: !s.isCollapsed })
                }
              ) : /* @__PURE__ */ h("div", { className: "gantt-task-list-toggle-spacer" }),
              /* @__PURE__ */ h("span", { className: "gantt-task-list-name", title: s.name, children: s.name })
            ]
          },
          s.id
        );
      })
    }
  );
}
const F = 5, Q = 12;
function Pt(t, e = 4) {
  const n = e, a = [
    `${t.targetX - F},${t.targetY - F}`,
    `${t.targetX},${t.targetY}`,
    `${t.targetX - F},${t.targetY + F}`
  ].join(" "), r = t.targetX - F;
  return t.targetX - t.sourceX > Q * 2 ? At(t, r, n, a) : Rt(t, r, n, a);
}
function At(t, e, n, a) {
  const r = t.sourceX + Q, s = t.targetY - t.sourceY;
  if (Math.abs(s) < 1)
    return {
      path: `M ${t.sourceX},${t.sourceY} L ${e},${t.targetY}`,
      arrowHead: a
    };
  const i = Math.min(n, Math.abs(s) / 2, Q / 2), o = s > 0 ? 1 : -1;
  return { path: [
    `M ${t.sourceX},${t.sourceY}`,
    // Horizontal to first turn
    `L ${r - i},${t.sourceY}`,
    // Round corner: turn from horizontal to vertical
    `Q ${r},${t.sourceY} ${r},${t.sourceY + i * o}`,
    // Vertical segment
    `L ${r},${t.targetY - i * o}`,
    // Round corner: turn from vertical to horizontal
    `Q ${r},${t.targetY} ${r + i},${t.targetY}`,
    // Horizontal to arrowhead
    `L ${e},${t.targetY}`
  ].join(" "), arrowHead: a };
}
function Rt(t, e, n, a) {
  const r = t.sourceX + Q, s = t.targetX - Q - F, i = t.sourceTop + t.sourceHeight, o = t.targetTop + t.targetHeight, c = Math.max(i, o) + t.rowHeight * 0.4, l = Math.min(n, Q / 2);
  return { path: [
    `M ${t.sourceX},${t.sourceY}`,
    // Right from source
    `L ${r - l},${t.sourceY}`,
    `Q ${r},${t.sourceY} ${r},${t.sourceY + l}`,
    // Down to detour level
    `L ${r},${c - l}`,
    `Q ${r},${c} ${r - l},${c}`,
    // Left to target column
    `L ${s + l},${c}`,
    `Q ${s},${c} ${s},${c - l}`,
    // Up to target row
    `L ${s},${t.targetY + l}`,
    `Q ${s},${t.targetY} ${s + l},${t.targetY}`,
    // Right to arrowhead
    `L ${e},${t.targetY}`
  ].join(" "), arrowHead: a };
}
function Bt({ tasks: t, bars: e, rowHeight: n }) {
  const a = et(() => {
    var i;
    const r = /* @__PURE__ */ new Map();
    for (const o of e)
      r.set(o.taskId, o);
    const s = [];
    for (const o of t) {
      if (!((i = o.dependencies) != null && i.length)) continue;
      const c = r.get(o.id);
      if (c)
        for (const l of o.dependencies) {
          const m = r.get(l);
          if (!m) continue;
          const T = Pt({
            sourceX: m.x + m.width,
            sourceY: m.y + m.height / 2,
            targetX: c.x,
            targetY: c.y + c.height / 2,
            rowHeight: n,
            sourceWidth: m.width,
            sourceTop: m.y,
            targetTop: c.y,
            sourceHeight: m.height,
            targetHeight: c.height
          });
          s.push({
            key: `${l}->${o.id}`,
            path: T.path,
            arrowHead: T.arrowHead
          });
        }
    }
    return s;
  }, [t, e, n]);
  return a.length === 0 ? null : /* @__PURE__ */ h("g", { className: "gantt-dependencies-layer", children: a.map((r) => /* @__PURE__ */ _("g", { children: [
    /* @__PURE__ */ h("path", { className: "gantt-arrow-path", d: r.path }),
    /* @__PURE__ */ h("polygon", { className: "gantt-arrow-head", points: r.arrowHead })
  ] }, r.key)) });
}
const Et = {
  day: 50,
  week: 80,
  month: 120
}, Ht = 50, bt = 40;
function Gt(t) {
  const {
    tasks: e,
    groups: n = [],
    viewMode: a = "week",
    taskListWidth: r = 0,
    rowHeight: s = Ht,
    columnWidth: i,
    readOnly: o = !1,
    showDependencies: c = !0,
    showTodayMarker: l = !0,
    theme: m,
    locale: T,
    initialCollapsed: B,
    onTaskClick: D,
    onTaskDoubleClick: v,
    onTaskMove: L,
    onTaskResize: Y,
    onProgressChange: k
  } = t, A = i ?? Et[a], { collapsedIds: g, toggleCollapse: w } = Dt(B), { containerRef: E, scrollLeft: G, handleScroll: $ } = It(), N = wt(
    e,
    n,
    a,
    s,
    A,
    g,
    T
  ), { rows: M, bars: P, columns: p, timeRange: f, totalWidth: y, totalHeight: d } = N, X = (u) => {
    if (u.startsWith("group-summary-")) {
      const lt = u.replace("group-summary-", "");
      w(lt);
    } else
      D == null || D(u);
  }, R = U(null), H = U(null), I = et(
    () => new Set(e.filter((u) => u.disabled).map((u) => u.id)),
    [e]
  ), S = Nt({
    svgRef: R,
    ghostRectRef: H,
    bars: P,
    timeRange: f,
    columnWidth: A,
    viewMode: a,
    readOnly: o,
    disabledTaskIds: I,
    onTaskMove: L,
    onTaskResize: Y,
    onProgressChange: k
  }), x = /* @__PURE__ */ new Date(), b = q(x, f, A, a), j = l && x >= f.start && x <= f.end, V = m ? Object.fromEntries(
    Object.entries(m).filter(([, u]) => u !== void 0)
  ) : {}, ct = [
    "gantt-core",
    S.isDragging && "gantt-core--dragging"
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ _("div", { className: ct, style: V, children: [
    /* @__PURE__ */ h(
      Tt,
      {
        columns: p,
        columnWidth: A,
        height: bt,
        scrollLeft: G,
        taskListWidth: r
      }
    ),
    /* @__PURE__ */ h("div", { className: "gantt-body", children: /* @__PURE__ */ h(
      "div",
      {
        ref: E,
        className: "gantt-timeline-container",
        onScroll: $,
        children: /* @__PURE__ */ _("div", { className: "gantt-body-inner", style: { width: r + y }, children: [
          /* @__PURE__ */ h(
            Yt,
            {
              rows: M,
              width: r,
              rowHeight: s,
              totalHeight: d,
              onToggleCollapse: w
            }
          ),
          /* @__PURE__ */ _(
            "svg",
            {
              ref: R,
              className: `gantt-svg${o ? "" : " gantt-svg--interactive"}`,
              width: y,
              height: d,
              onPointerMove: S.handlePointerMove,
              onPointerUp: S.handlePointerUp,
              children: [
                /* @__PURE__ */ _("g", { className: "gantt-grid-layer", children: [
                  p.filter((u) => u.isWeekend).map((u) => /* @__PURE__ */ h(
                    "rect",
                    {
                      className: "gantt-weekend-rect",
                      x: u.x,
                      y: 0,
                      width: A,
                      height: d
                    },
                    `weekend-${u.index}`
                  )),
                  p.map((u) => /* @__PURE__ */ h(
                    "line",
                    {
                      className: "gantt-grid-line",
                      x1: u.x,
                      y1: 0,
                      x2: u.x,
                      y2: d
                    },
                    `line-${u.index}`
                  )),
                  M.map((u) => /* @__PURE__ */ h(
                    "line",
                    {
                      className: "gantt-grid-line",
                      x1: 0,
                      y1: u.y + u.height,
                      x2: y,
                      y2: u.y + u.height
                    },
                    `hline-${u.id}`
                  )),
                  M.filter((u) => u.type === "group").map((u) => /* @__PURE__ */ h(
                    "rect",
                    {
                      className: "gantt-group-row",
                      x: 0,
                      y: u.y,
                      width: y,
                      height: u.height
                    },
                    `group-bg-${u.id}`
                  ))
                ] }),
                c && /* @__PURE__ */ h(
                  Bt,
                  {
                    tasks: e,
                    bars: P,
                    rowHeight: s
                  }
                ),
                /* @__PURE__ */ h("g", { className: "gantt-bars-layer", children: P.map((u) => /* @__PURE__ */ h(
                  Lt,
                  {
                    bar: u,
                    readOnly: o,
                    disabled: I.has(u.taskId),
                    onClick: X,
                    onDoubleClick: v,
                    onMoveStart: S.handleMoveStart,
                    onResizeLeftStart: S.handleResizeLeftStart,
                    onResizeRightStart: S.handleResizeRightStart,
                    onProgressStart: S.handleProgressStart,
                    didDrag: S.didDrag,
                    clearDidDrag: S.clearDidDrag
                  },
                  u.taskId
                )) }),
                /* @__PURE__ */ h("g", { className: "gantt-ghost-layer", children: /* @__PURE__ */ h(
                  "rect",
                  {
                    ref: H,
                    className: "gantt-bar-ghost",
                    rx: 4,
                    ry: 4,
                    style: { display: "none" }
                  }
                ) }),
                j && /* @__PURE__ */ h("g", { className: "gantt-today-layer", children: /* @__PURE__ */ h(
                  "line",
                  {
                    className: "gantt-today-line",
                    x1: b,
                    y1: 0,
                    x2: b,
                    y2: d
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
function z(t) {
  return Math.max(0, Math.min(255, Math.round(t)));
}
function Wt(t, e = 40) {
  const [n, a, r] = at(t);
  return `#${z(n - e).toString(16).padStart(2, "0")}${z(a - e).toString(16).padStart(2, "0")}${z(r - e).toString(16).padStart(2, "0")}`;
}
function jt(t, e = 40) {
  const [n, a, r] = at(t);
  return `#${z(n + e).toString(16).padStart(2, "0")}${z(a + e).toString(16).padStart(2, "0")}${z(r + e).toString(16).padStart(2, "0")}`;
}
function Ft(t, e) {
  const [n, a, r] = at(t);
  return `rgba(${n}, ${a}, ${r}, ${e})`;
}
export {
  Gt as GanttChart,
  Pt as computeArrowPath,
  Wt as darkenHex,
  Ft as hexToRgba,
  jt as lightenHex,
  Dt as useGanttTree
};
