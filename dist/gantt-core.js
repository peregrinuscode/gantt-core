import { jsxs as O, jsx as g, Fragment as lt } from "react/jsx-runtime";
import { useMemo as tt, useState as et, useCallback as X, useRef as Q } from "react";
function _(t) {
  const e = new Date(t);
  return e.setHours(0, 0, 0, 0), e;
}
function q(t) {
  const e = _(t), r = e.getDay(), a = r === 0 ? 6 : r - 1;
  return e.setDate(e.getDate() - a), e;
}
function V(t) {
  const e = _(t);
  return e.setDate(1), e;
}
const dt = 864e5;
function gt(t, e) {
  return (_(e).getTime() - _(t).getTime()) / dt;
}
function H(t, e) {
  const r = new Date(t);
  return r.setDate(r.getDate() + e), r;
}
function nt(t, e) {
  const r = new Date(t);
  return r.setMonth(r.getMonth() + e), r;
}
function ht(t, e = "week") {
  if (t.length === 0) {
    const l = /* @__PURE__ */ new Date();
    return { start: H(l, -14), end: H(l, 14) };
  }
  let r = t[0].start.getTime(), a = t[0].end.getTime();
  for (const l of t)
    l.start.getTime() < r && (r = l.start.getTime()), l.end.getTime() > a && (a = l.end.getTime());
  const n = e === "month" ? 30 : 7, s = H(new Date(r), -n), d = H(new Date(a), n), o = e === "month" ? V(s) : e === "week" ? q(s) : _(s), c = e === "month" ? V(nt(d, 1)) : e === "week" ? H(q(d), 7) : H(_(d), 1);
  return { start: o, end: c };
}
function U(t, e, r, a) {
  if (a === "month") {
    const d = ft(e.start, t), o = rt(t), l = (t.getDate() - 1) / o;
    return (Math.floor(d) + l) * r;
  }
  return gt(e.start, t) / (a === "week" ? 7 : 1) * r;
}
function ot(t, e, r, a) {
  if (a === "month") {
    const d = t / r, o = Math.floor(d), c = d - o, l = nt(e.start, o), x = rt(l);
    return H(l, Math.round(c * x));
  }
  const n = a === "week" ? 7 : 1, s = t / r * n;
  return H(e.start, Math.round(s));
}
function ut(t, e, r, a) {
  const n = [];
  if (r === "month") {
    let c = V(t.start), l = 0;
    for (; c.getTime() < t.end.getTime(); )
      n.push({
        index: l,
        date: new Date(c),
        label: yt(c, a),
        x: l * e,
        isWeekend: !1
      }), c = nt(c, 1), l++;
    return n;
  }
  const s = r === "week" ? 7 : 1;
  let d = r === "week" ? q(t.start) : _(t.start), o = 0;
  for (; d.getTime() < t.end.getTime(); ) {
    const c = d.getDay();
    n.push({
      index: o,
      date: new Date(d),
      label: r === "week" ? pt(d, a) : mt(d, a),
      x: o * e,
      isWeekend: c === 0 || c === 6
    }), d = H(d, s), o++;
  }
  return n;
}
function it(t, e) {
  switch (e) {
    case "day":
      return _(t);
    case "week":
      return q(t);
    case "month":
      return V(t);
  }
}
function ft(t, e) {
  return (e.getFullYear() - t.getFullYear()) * 12 + (e.getMonth() - t.getMonth()) + (e.getDate() - t.getDate()) / rt(t);
}
function rt(t) {
  return new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
}
function mt(t, e) {
  return t.toLocaleDateString(e, { month: "short", day: "numeric" });
}
function pt(t, e) {
  return t.toLocaleDateString(e, { month: "short", day: "numeric" });
}
function yt(t, e) {
  return t.toLocaleDateString(e, { month: "short", year: "numeric" });
}
function st(t) {
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
function b(t) {
  return Math.max(0, Math.min(255, Math.round(t)));
}
function Wt(t, e = 40) {
  const [r, a, n] = st(t);
  return `#${b(r - e).toString(16).padStart(2, "0")}${b(a - e).toString(16).padStart(2, "0")}${b(n - e).toString(16).padStart(2, "0")}`;
}
function bt(t, e = 40) {
  const [r, a, n] = st(t);
  return `#${b(r + e).toString(16).padStart(2, "0")}${b(a + e).toString(16).padStart(2, "0")}${b(n + e).toString(16).padStart(2, "0")}`;
}
function xt(t, e) {
  const [r, a, n] = st(t);
  return `rgba(${r}, ${a}, ${n}, ${e})`;
}
const $t = "#3f51b5", kt = 0.7;
function Dt(t, e, r, a, n, s, d) {
  return tt(() => {
    const o = ht(t, r), c = ut(o, n, r, d), l = /* @__PURE__ */ new Map();
    for (const i of e)
      l.set(i.id, i.color);
    const x = /* @__PURE__ */ new Map(), S = /* @__PURE__ */ new Map();
    for (const i of t)
      if (x.set(i.id, i), i.parentId) {
        const k = S.get(i.parentId) ?? [];
        k.push(i), S.set(i.parentId, k);
      }
    const P = [...e].sort(
      (i, k) => (i.sortOrder ?? 0) - (k.sortOrder ?? 0)
    ), I = [], L = [], T = a * kt;
    function Y(i, k, E) {
      const R = [...i].sort(
        ($, w) => ($.sortOrder ?? 0) - (w.sortOrder ?? 0)
      );
      for (const $ of R) {
        const w = I.length * a, v = S.get($.id), f = !!v && v.length > 0, u = s.has($.id);
        I.push({
          type: "task",
          id: `task-${$.id}`,
          y: w,
          height: a,
          groupId: k,
          taskId: $.id,
          level: E,
          name: $.name,
          color: $.color ?? l.get(k),
          hasChildren: f,
          isCollapsed: u
        });
        const m = U($.start, o, n, r), y = U($.end, o, n, r), D = Math.max(y - m, 2), B = $.color ?? l.get(k) ?? $t;
        L.push({
          taskId: $.id,
          x: m,
          y: w + (a - T) / 2,
          width: D,
          height: T,
          color: B,
          progress: $.progress,
          name: $.name
        }), v && !u && Y(v, k, E + 1);
      }
    }
    if (P.length > 0)
      for (const i of P) {
        const k = t.filter(
          (w) => w.groupId === i.id && !w.parentId
        ), E = k.length > 0, R = s.has(i.id), $ = I.length * a;
        if (I.push({
          type: "group",
          id: `group-${i.id}`,
          y: $,
          height: a,
          groupId: i.id,
          level: 0,
          name: i.name,
          color: i.color,
          hasChildren: E,
          isCollapsed: R
        }), !R)
          Y(k, i.id, 1);
        else if (E) {
          const w = t.filter((D) => D.groupId === i.id);
          let v = w[0].start, f = w[0].end;
          for (const D of w)
            D.start < v && (v = D.start), D.end > f && (f = D.end);
          const u = U(v, o, n, r), m = U(f, o, n, r), y = Math.max(m - u, 2);
          L.push({
            taskId: `group-summary-${i.id}`,
            x: u,
            y: $ + (a - T) / 2,
            width: y,
            height: T,
            color: xt(i.color, 0.5),
            progress: 0,
            name: i.name,
            isSummary: !0
          });
        }
      }
    else {
      const i = t.filter((k) => !k.parentId);
      Y(i, "", 1);
    }
    const C = c.length > 0 ? c[c.length - 1].x + n : 0, M = I.length * a;
    return { rows: I, bars: L, columns: c, timeRange: o, totalWidth: C, totalHeight: M };
  }, [t, e, r, a, n, s, d]);
}
function wt(t) {
  const [e, r] = et(
    () => new Set(t)
  ), a = X((s) => {
    r((d) => {
      const o = new Set(d);
      return o.has(s) ? o.delete(s) : o.add(s), o;
    });
  }, []), n = X(
    (s) => e.has(s),
    [e]
  );
  return { collapsedIds: e, toggleCollapse: a, isCollapsed: n };
}
function It() {
  const t = Q(null), [e, r] = et(0), a = X(() => {
    t.current && r(t.current.scrollLeft);
  }, []);
  return { containerRef: t, scrollLeft: e, handleScroll: a };
}
const St = 3, Z = 10;
function Nt(t) {
  const {
    svgRef: e,
    bars: r,
    timeRange: a,
    columnWidth: n,
    viewMode: s,
    readOnly: d = !1,
    disabledTaskIds: o,
    onTaskMove: c,
    onTaskResize: l,
    onProgressChange: x
  } = t, [S, P] = et(null), I = Q(null), L = Q(!1), T = Q(null), Y = X(
    (f) => r.find((u) => u.taskId === f),
    [r]
  ), C = X(
    (f) => {
      var m;
      const u = ((m = e.current) == null ? void 0 : m.getBoundingClientRect().left) ?? 0;
      return f - u;
    },
    [e]
  ), M = X(
    (f, u, m) => {
      if (d || o != null && o.has(f)) return;
      const y = Y(f);
      y && (m.target.setPointerCapture(m.pointerId), m.preventDefault(), I.current = {
        startClientX: m.clientX,
        originalBar: { ...y },
        mode: u,
        taskId: f,
        activated: !1
      }, L.current = !1);
    },
    [d, o, Y]
  ), i = X(
    (f) => {
      const u = I.current;
      if (!u) return;
      const m = f.clientX - u.startClientX, { originalBar: y, mode: D, taskId: B } = u;
      if (!u.activated) {
        if (Math.abs(m) < St) return;
        u.activated = !0, L.current = !0, P({
          taskId: B,
          mode: D,
          originalBar: y,
          ghostBar: { ...y },
          ghostProgress: y.progress
        });
      }
      let A;
      if (D === "progress") {
        const G = (C(f.clientX) - y.x) / y.width * 100;
        A = Math.round(Math.max(0, Math.min(100, G)));
      }
      P((p) => {
        if (!p) return null;
        const N = { ...p.originalBar };
        let G = p.originalBar.progress;
        switch (D) {
          case "move":
            N.x = y.x + m;
            break;
          case "resize-left": {
            const F = y.x + m, z = y.width - m;
            z >= Z ? (N.x = F, N.width = z) : (N.x = y.x + y.width - Z, N.width = Z);
            break;
          }
          case "resize-right": {
            const F = y.width + m;
            N.width = Math.max(F, Z);
            break;
          }
          case "progress":
            G = A;
            break;
        }
        return {
          ...p,
          ghostBar: N,
          ghostProgress: G
        };
      });
    },
    [C]
  ), k = X(
    (f) => {
      const u = I.current;
      if (u) {
        if (f.target.releasePointerCapture(f.pointerId), I.current = null, !u.activated) {
          P(null);
          return;
        }
        P((m) => (T.current = m, null)), queueMicrotask(() => {
          const m = T.current;
          if (T.current = null, !m) return;
          const { mode: y, taskId: D, ghostBar: B, ghostProgress: A } = m;
          if (y === "progress")
            x == null || x({ taskId: D, progress: A });
          else {
            const p = it(
              ot(B.x, a, n, s),
              s
            ), N = it(
              ot(B.x + B.width, a, n, s),
              s
            );
            y === "move" ? c == null || c({ taskId: D, start: p, end: N }) : l == null || l({ taskId: D, start: p, end: N });
          }
        });
      }
    },
    [a, n, s, c, l, x]
  ), E = X(
    (f, u) => M(f, "move", u),
    [M]
  ), R = X(
    (f, u) => M(f, "resize-left", u),
    [M]
  ), $ = X(
    (f, u) => M(f, "resize-right", u),
    [M]
  ), w = X(
    (f, u) => M(f, "progress", u),
    [M]
  ), v = X(() => {
    L.current = !1;
  }, []);
  return {
    dragState: S,
    isDragging: S !== null,
    didDrag: L.current,
    clearDidDrag: v,
    handleMoveStart: E,
    handleResizeLeftStart: R,
    handleResizeRightStart: $,
    handleProgressStart: w,
    handlePointerMove: i,
    handlePointerUp: k
  };
}
function Tt({
  columns: t,
  columnWidth: e,
  height: r,
  scrollLeft: a,
  taskListWidth: n
}) {
  return /* @__PURE__ */ O("div", { className: "gantt-header", style: { height: r }, children: [
    n > 0 && /* @__PURE__ */ g(
      "div",
      {
        className: "gantt-header-cell gantt-header-cell--task-list",
        style: { width: n, height: r },
        children: "Tasks"
      }
    ),
    /* @__PURE__ */ g("div", { className: "gantt-header-dates", style: { overflow: "hidden", flex: 1 }, children: /* @__PURE__ */ g(
      "div",
      {
        style: {
          display: "flex",
          transform: `translateX(-${a}px)`
        },
        children: t.map((s) => /* @__PURE__ */ g(
          "div",
          {
            className: "gantt-header-cell",
            style: { width: e, height: r },
            children: s.label
          },
          s.index
        ))
      }
    ) })
  ] });
}
const Mt = 60, K = 8, vt = 5;
function Lt({
  bar: t,
  readOnly: e,
  disabled: r,
  progressOverride: a,
  onClick: n,
  onDoubleClick: s,
  onMoveStart: d,
  onResizeLeftStart: o,
  onResizeRightStart: c,
  onProgressStart: l,
  didDrag: x,
  clearDidDrag: S
}) {
  const I = a ?? t.progress, L = t.width * (I / 100), T = !e && !r && !t.isSummary, Y = (i) => {
    if (x) {
      S == null || S(), i.stopPropagation();
      return;
    }
    n == null || n(t.taskId);
  }, C = () => {
    x || s == null || s(t.taskId);
  }, M = [
    "gantt-bar-group",
    T && "gantt-bar-group--interactive",
    r && "gantt-bar-group--disabled",
    t.isSummary && "gantt-bar-group--summary"
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ O(
    "g",
    {
      className: M,
      onClick: Y,
      onDoubleClick: C,
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
            onPointerDown: T ? (i) => d == null ? void 0 : d(t.taskId, i) : void 0
          }
        ),
        I > 0 && /* @__PURE__ */ g(
          "rect",
          {
            className: "gantt-bar-progress",
            x: t.x,
            y: t.y,
            width: t.width,
            height: t.height,
            rx: 4,
            ry: 4,
            fill: "var(--gantt-bar-progress-fill)",
            clipPath: `inset(0 ${t.width - L}px 0 0)`
          }
        ),
        t.width > Mt && /* @__PURE__ */ g(
          "text",
          {
            className: "gantt-bar-label",
            x: t.x + t.width / 2,
            y: t.y + t.height / 2,
            children: t.name
          }
        ),
        T && /* @__PURE__ */ O(lt, { children: [
          /* @__PURE__ */ g(
            "rect",
            {
              className: "gantt-bar-resize-handle",
              x: t.x,
              y: t.y,
              width: K,
              height: t.height,
              rx: 4,
              ry: 4,
              onPointerDown: (i) => {
                i.stopPropagation(), o == null || o(t.taskId, i);
              }
            }
          ),
          /* @__PURE__ */ g(
            "rect",
            {
              className: "gantt-bar-resize-handle",
              x: t.x + t.width - K,
              y: t.y,
              width: K,
              height: t.height,
              rx: 4,
              ry: 4,
              onPointerDown: (i) => {
                i.stopPropagation(), c == null || c(t.taskId, i);
              }
            }
          ),
          /* @__PURE__ */ g(
            "circle",
            {
              className: "gantt-bar-progress-handle",
              cx: t.x + L,
              cy: t.y + t.height / 2,
              r: vt,
              onPointerDown: (i) => {
                i.stopPropagation(), l == null || l(t.taskId, i);
              }
            }
          )
        ] })
      ]
    }
  );
}
const Xt = 16;
function Pt({ expanded: t }) {
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
function Ct({
  rows: t,
  width: e,
  rowHeight: r,
  totalHeight: a,
  onToggleCollapse: n
}) {
  return e <= 0 ? null : /* @__PURE__ */ g(
    "div",
    {
      className: "gantt-task-list",
      style: { width: e, minHeight: a },
      role: "list",
      children: t.map((s) => {
        const d = s.type === "group" ? s.groupId : s.taskId, o = s.level * Xt;
        return /* @__PURE__ */ O(
          "div",
          {
            className: `gantt-task-list-row ${s.type === "group" ? "gantt-task-list-row--group" : ""}`,
            style: { height: r },
            role: "listitem",
            children: [
              s.type === "group" && s.color && /* @__PURE__ */ g(
                "div",
                {
                  className: "gantt-task-list-accent",
                  style: { backgroundColor: s.color }
                }
              ),
              /* @__PURE__ */ g("div", { style: { width: o, flexShrink: 0 } }),
              s.hasChildren ? /* @__PURE__ */ g(
                "button",
                {
                  className: "gantt-task-list-toggle",
                  onClick: () => n(d),
                  "aria-label": s.isCollapsed ? `Expand ${s.name}` : `Collapse ${s.name}`,
                  "aria-expanded": !s.isCollapsed,
                  children: /* @__PURE__ */ g(Pt, { expanded: !s.isCollapsed })
                }
              ) : /* @__PURE__ */ g("div", { className: "gantt-task-list-toggle-spacer" }),
              /* @__PURE__ */ g("span", { className: "gantt-task-list-name", title: s.name, children: s.name })
            ]
          },
          s.id
        );
      })
    }
  );
}
const W = 5, j = 12;
function Yt(t, e = 4) {
  const r = e, a = [
    `${t.targetX - W},${t.targetY - W}`,
    `${t.targetX},${t.targetY}`,
    `${t.targetX - W},${t.targetY + W}`
  ].join(" "), n = t.targetX - W;
  return t.targetX - t.sourceX > j * 2 ? Bt(t, n, r, a) : Et(t, n, r, a);
}
function Bt(t, e, r, a) {
  const n = t.sourceX + j, s = t.targetY - t.sourceY;
  if (Math.abs(s) < 1)
    return {
      path: `M ${t.sourceX},${t.sourceY} L ${e},${t.targetY}`,
      arrowHead: a
    };
  const d = Math.min(r, Math.abs(s) / 2, j / 2), o = s > 0 ? 1 : -1;
  return { path: [
    `M ${t.sourceX},${t.sourceY}`,
    // Horizontal to first turn
    `L ${n - d},${t.sourceY}`,
    // Round corner: turn from horizontal to vertical
    `Q ${n},${t.sourceY} ${n},${t.sourceY + d * o}`,
    // Vertical segment
    `L ${n},${t.targetY - d * o}`,
    // Round corner: turn from vertical to horizontal
    `Q ${n},${t.targetY} ${n + d},${t.targetY}`,
    // Horizontal to arrowhead
    `L ${e},${t.targetY}`
  ].join(" "), arrowHead: a };
}
function Et(t, e, r, a) {
  const n = t.sourceX + j, s = t.targetX - j - W, d = t.sourceTop + t.sourceHeight, o = t.targetTop + t.targetHeight, c = Math.max(d, o) + t.rowHeight * 0.4, l = Math.min(r, j / 2);
  return { path: [
    `M ${t.sourceX},${t.sourceY}`,
    // Right from source
    `L ${n - l},${t.sourceY}`,
    `Q ${n},${t.sourceY} ${n},${t.sourceY + l}`,
    // Down to detour level
    `L ${n},${c - l}`,
    `Q ${n},${c} ${n - l},${c}`,
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
function Ht({ tasks: t, bars: e, rowHeight: r }) {
  const a = tt(() => {
    var d;
    const n = /* @__PURE__ */ new Map();
    for (const o of e)
      n.set(o.taskId, o);
    const s = [];
    for (const o of t) {
      if (!((d = o.dependencies) != null && d.length)) continue;
      const c = n.get(o.id);
      if (c)
        for (const l of o.dependencies) {
          const x = n.get(l);
          if (!x) continue;
          const S = Yt({
            sourceX: x.x + x.width,
            sourceY: x.y + x.height / 2,
            targetX: c.x,
            targetY: c.y + c.height / 2,
            rowHeight: r,
            sourceWidth: x.width,
            sourceTop: x.y,
            targetTop: c.y,
            sourceHeight: x.height,
            targetHeight: c.height
          });
          s.push({
            key: `${l}->${o.id}`,
            path: S.path,
            arrowHead: S.arrowHead
          });
        }
    }
    return s;
  }, [t, e, r]);
  return a.length === 0 ? null : /* @__PURE__ */ g("g", { className: "gantt-dependencies-layer", children: a.map((n) => /* @__PURE__ */ O("g", { children: [
    /* @__PURE__ */ g("path", { className: "gantt-arrow-path", d: n.path }),
    /* @__PURE__ */ g("polygon", { className: "gantt-arrow-head", points: n.arrowHead })
  ] }, n.key)) });
}
const Ot = {
  day: 50,
  week: 80,
  month: 120
}, Rt = 50, _t = 40;
function jt(t) {
  const {
    tasks: e,
    groups: r = [],
    viewMode: a = "week",
    taskListWidth: n = 0,
    rowHeight: s = Rt,
    columnWidth: d,
    readOnly: o = !1,
    showDependencies: c = !0,
    showTodayMarker: l = !0,
    theme: x,
    locale: S,
    onTaskClick: P,
    onTaskDoubleClick: I,
    onTaskMove: L,
    onTaskResize: T,
    onProgressChange: Y
  } = t, C = d ?? Ot[a], { collapsedIds: M, toggleCollapse: i } = wt(), { containerRef: k, scrollLeft: E, handleScroll: R } = It(), $ = Dt(
    e,
    r,
    a,
    s,
    C,
    M,
    S
  ), { rows: w, bars: v, columns: f, timeRange: u, totalWidth: m, totalHeight: y } = $, D = (h) => {
    if (h.startsWith("group-summary-")) {
      const J = h.replace("group-summary-", "");
      i(J);
    } else
      P == null || P(h);
  }, B = Q(null), A = tt(
    () => new Set(e.filter((h) => h.disabled).map((h) => h.id)),
    [e]
  ), p = Nt({
    svgRef: B,
    bars: v,
    timeRange: u,
    columnWidth: C,
    viewMode: a,
    readOnly: o,
    disabledTaskIds: A,
    onTaskMove: L,
    onTaskResize: T,
    onProgressChange: Y
  }), N = /* @__PURE__ */ new Date(), G = U(N, u, C, a), F = l && N >= u.start && N <= u.end, z = x ? Object.fromEntries(
    Object.entries(x).filter(([, h]) => h !== void 0)
  ) : {}, ct = [
    "gantt-core",
    p.isDragging && "gantt-core--dragging"
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ O("div", { className: ct, style: z, children: [
    /* @__PURE__ */ g(
      Tt,
      {
        columns: f,
        columnWidth: C,
        height: _t,
        scrollLeft: E,
        taskListWidth: n
      }
    ),
    /* @__PURE__ */ g("div", { className: "gantt-body", children: /* @__PURE__ */ g(
      "div",
      {
        ref: k,
        className: "gantt-timeline-container",
        onScroll: R,
        children: /* @__PURE__ */ O("div", { className: "gantt-body-inner", style: { width: n + m }, children: [
          /* @__PURE__ */ g(
            Ct,
            {
              rows: w,
              width: n,
              rowHeight: s,
              totalHeight: y,
              onToggleCollapse: i
            }
          ),
          /* @__PURE__ */ O(
            "svg",
            {
              ref: B,
              className: `gantt-svg${o ? "" : " gantt-svg--interactive"}`,
              width: m,
              height: y,
              onPointerMove: p.handlePointerMove,
              onPointerUp: p.handlePointerUp,
              children: [
                /* @__PURE__ */ O("g", { className: "gantt-grid-layer", children: [
                  f.filter((h) => h.isWeekend).map((h) => /* @__PURE__ */ g(
                    "rect",
                    {
                      className: "gantt-weekend-rect",
                      x: h.x,
                      y: 0,
                      width: C,
                      height: y
                    },
                    `weekend-${h.index}`
                  )),
                  f.map((h) => /* @__PURE__ */ g(
                    "line",
                    {
                      className: "gantt-grid-line",
                      x1: h.x,
                      y1: 0,
                      x2: h.x,
                      y2: y
                    },
                    `line-${h.index}`
                  )),
                  w.map((h) => /* @__PURE__ */ g(
                    "line",
                    {
                      className: "gantt-grid-line",
                      x1: 0,
                      y1: h.y + h.height,
                      x2: m,
                      y2: h.y + h.height
                    },
                    `hline-${h.id}`
                  )),
                  w.filter((h) => h.type === "group").map((h) => /* @__PURE__ */ g(
                    "rect",
                    {
                      className: "gantt-group-row",
                      x: 0,
                      y: h.y,
                      width: m,
                      height: h.height
                    },
                    `group-bg-${h.id}`
                  ))
                ] }),
                c && /* @__PURE__ */ g(
                  Ht,
                  {
                    tasks: e,
                    bars: v,
                    rowHeight: s
                  }
                ),
                /* @__PURE__ */ g("g", { className: "gantt-bars-layer", children: v.map((h) => {
                  var at;
                  const J = ((at = p.dragState) == null ? void 0 : at.mode) === "progress" && p.dragState.taskId === h.taskId;
                  return /* @__PURE__ */ g(
                    Lt,
                    {
                      bar: h,
                      readOnly: o,
                      disabled: A.has(h.taskId),
                      progressOverride: J ? p.dragState.ghostProgress : void 0,
                      onClick: D,
                      onDoubleClick: I,
                      onMoveStart: p.handleMoveStart,
                      onResizeLeftStart: p.handleResizeLeftStart,
                      onResizeRightStart: p.handleResizeRightStart,
                      onProgressStart: p.handleProgressStart,
                      didDrag: p.didDrag,
                      clearDidDrag: p.clearDidDrag
                    },
                    h.taskId
                  );
                }) }),
                p.dragState && p.dragState.mode !== "progress" && /* @__PURE__ */ g("g", { className: "gantt-ghost-layer", children: /* @__PURE__ */ g(
                  "rect",
                  {
                    className: "gantt-bar-ghost",
                    x: p.dragState.ghostBar.x,
                    y: p.dragState.ghostBar.y,
                    width: p.dragState.ghostBar.width,
                    height: p.dragState.ghostBar.height,
                    rx: 4,
                    ry: 4,
                    fill: p.dragState.ghostBar.color
                  }
                ) }),
                F && /* @__PURE__ */ g("g", { className: "gantt-today-layer", children: /* @__PURE__ */ g(
                  "line",
                  {
                    className: "gantt-today-line",
                    x1: G,
                    y1: 0,
                    x2: G,
                    y2: y
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
export {
  jt as GanttChart,
  Yt as computeArrowPath,
  Wt as darkenHex,
  xt as hexToRgba,
  bt as lightenHex,
  wt as useGanttTree
};
