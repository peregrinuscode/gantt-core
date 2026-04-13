import { jsxs as G, jsx as g, Fragment as $t } from "react/jsx-runtime";
import { useMemo as st, useState as rt, useCallback as H, useRef as Z } from "react";
function z(t) {
  const e = new Date(t);
  return e.setHours(0, 0, 0, 0), e;
}
function X(t) {
  const e = z(t), s = e.getDay(), r = s === 0 ? 6 : s - 1;
  return e.setDate(e.getDate() - r), e;
}
function Y(t) {
  const e = z(t);
  return e.setDate(1), e;
}
const yt = 864e5;
function xt(t, e) {
  return (z(e).getTime() - z(t).getTime()) / yt;
}
function j(t, e) {
  const s = new Date(t);
  return s.setDate(s.getDate() + e), s;
}
function at(t, e) {
  const s = new Date(t);
  return s.setMonth(s.getMonth() + e), s;
}
function kt(t, e = "week") {
  if (t.length === 0) {
    const l = /* @__PURE__ */ new Date();
    return { start: j(l, -14), end: j(l, 14) };
  }
  let s = t[0].start.getTime(), r = t[0].end.getTime();
  for (const l of t)
    l.start.getTime() < s && (s = l.start.getTime()), l.end.getTime() > r && (r = l.end.getTime());
  const n = e === "month" ? 30 : 7, a = j(new Date(s), -n), o = j(new Date(r), n), i = e === "month" ? Y(a) : e === "week" ? X(a) : z(a), c = e === "month" ? Y(at(o, 1)) : e === "week" ? j(X(o), 7) : j(z(o), 1);
  return { start: i, end: c };
}
function q(t, e, s, r) {
  if (r === "month") {
    const o = wt(e.start, t), i = ot(t), l = (t.getDate() - 1) / i;
    return (Math.floor(o) + l) * s;
  }
  return xt(e.start, t) / (r === "week" ? 7 : 1) * s;
}
function tt(t, e, s, r) {
  if (r === "month") {
    const o = t / s, i = Math.floor(o), c = o - i, l = at(e.start, i), k = ot(l);
    return j(l, Math.round(c * k));
  }
  const n = r === "week" ? 7 : 1, a = t / s * n;
  return j(e.start, Math.round(a));
}
function Dt(t, e, s, r) {
  const n = [];
  if (s === "month") {
    let c = Y(t.start), l = 0;
    for (; c.getTime() < t.end.getTime(); )
      n.push({
        index: l,
        date: new Date(c),
        label: Tt(c, r),
        x: l * e,
        isWeekend: !1
      }), c = at(c, 1), l++;
    return n;
  }
  const a = s === "week" ? 7 : 1;
  let o = s === "week" ? X(t.start) : z(t.start), i = 0;
  for (; o.getTime() < t.end.getTime(); ) {
    const c = o.getDay();
    n.push({
      index: i,
      date: new Date(o),
      label: s === "week" ? It(o, r) : Lt(o, r),
      x: i * e,
      isWeekend: c === 0 || c === 6
    }), o = j(o, a), i++;
  }
  return n;
}
function et(t, e) {
  switch (e) {
    case "day":
      return z(t);
    case "week":
      return X(t);
    case "month":
      return Y(t);
  }
}
function wt(t, e) {
  return (e.getFullYear() - t.getFullYear()) * 12 + (e.getMonth() - t.getMonth()) + (e.getDate() - t.getDate()) / ot(t);
}
function ot(t) {
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
const St = "#3f51b5", Nt = 0.7;
function Mt(t, e, s, r, n, a, o) {
  return st(() => {
    const i = kt(t, s), c = Dt(i, n, s, o), l = /* @__PURE__ */ new Map();
    for (const d of e)
      l.set(d.id, d.color);
    const k = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Map();
    for (const d of t)
      if (k.set(d.id, d), d.parentId) {
        const L = x.get(d.parentId) ?? [];
        L.push(d), x.set(d.parentId, L);
      }
    const P = [...e].sort(
      (d, L) => (d.sortOrder ?? 0) - (L.sortOrder ?? 0)
    ), S = [], w = [], I = r * Nt;
    function A(d, L, W) {
      const b = [...d].sort(
        (m, v) => (m.sortOrder ?? 0) - (v.sortOrder ?? 0)
      );
      for (const m of b) {
        const v = S.length * r, B = x.get(m.id), _ = !!B && B.length > 0, f = a.has(m.id);
        S.push({
          type: "task",
          id: `task-${m.id}`,
          y: v,
          height: r,
          groupId: L,
          taskId: m.id,
          level: W,
          name: m.name,
          color: m.color ?? l.get(L),
          hasChildren: _,
          isCollapsed: f
        });
        const p = m.color ?? l.get(L) ?? St;
        if (m.start.getTime() === m.end.getTime()) {
          const h = q(m.start, i, n, s);
          w.push({
            taskId: m.id,
            x: h - I / 2,
            y: v + (r - I) / 2,
            width: I,
            height: I,
            color: p,
            progress: 0,
            name: m.name,
            kind: "milestone",
            critical: m.critical
          });
        } else {
          const h = q(m.start, i, n, s), N = q(m.end, i, n, s), E = Math.max(N - h, 2);
          w.push({
            taskId: m.id,
            x: h,
            y: v + (r - I) / 2,
            width: E,
            height: I,
            color: p,
            progress: m.progress,
            name: m.name,
            kind: "bar",
            critical: m.critical
          });
        }
        B && !f && A(B, L, W + 1);
      }
    }
    if (P.length > 0)
      for (const d of P) {
        const L = t.filter(
          (v) => v.groupId === d.id && !v.parentId
        ), W = L.length > 0, b = a.has(d.id), m = S.length * r;
        if (S.push({
          type: "group",
          id: `group-${d.id}`,
          y: m,
          height: r,
          groupId: d.id,
          level: 0,
          name: d.name,
          color: d.color,
          hasChildren: W,
          isCollapsed: b
        }), !b)
          A(L, d.id, 1);
        else if (W) {
          const v = t.filter((h) => h.groupId === d.id);
          let B = v[0].start, _ = v[0].end;
          for (const h of v)
            h.start < B && (B = h.start), h.end > _ && (_ = h.end);
          const f = q(B, i, n, s), p = q(_, i, n, s), $ = Math.max(p - f, 2);
          w.push({
            taskId: `group-summary-${d.id}`,
            x: f,
            y: m + (r - I) / 2,
            width: $,
            height: I,
            color: d.color,
            progress: 0,
            name: d.name,
            kind: "bar",
            isSummary: !0
          });
        }
      }
    else {
      const d = t.filter((L) => !L.parentId);
      A(d, "", 1);
    }
    const D = c.length > 0 ? c[c.length - 1].x + n : 0, R = S.length * r;
    return { rows: S, bars: w, columns: c, timeRange: i, totalWidth: D, totalHeight: R };
  }, [t, e, s, r, n, a, o]);
}
function vt(t) {
  const [e, s] = rt(
    () => new Set(t)
  ), r = H((a) => {
    s((o) => {
      const i = new Set(o);
      return i.has(a) ? i.delete(a) : i.add(a), i;
    });
  }, []), n = H(
    (a) => e.has(a),
    [e]
  );
  return { collapsedIds: e, toggleCollapse: r, isCollapsed: n };
}
function Pt() {
  const t = Z(null), [e, s] = rt(0), r = H(() => {
    t.current && s(t.current.scrollLeft);
  }, []);
  return { containerRef: t, scrollLeft: e, handleScroll: r };
}
const Ct = 3, K = 10;
function At(t) {
  const {
    svgRef: e,
    ghostRectRef: s,
    bars: r,
    timeRange: n,
    columnWidth: a,
    viewMode: o,
    readOnly: i = !1,
    disabledTaskIds: c,
    onTaskMove: l,
    onTaskResize: k,
    onProgressChange: x
  } = t, [P, S] = rt(!1), w = Z(null), I = Z(null), A = Z(!1), D = H(
    (f) => r.find((p) => p.taskId === f),
    [r]
  ), R = H(
    (f) => {
      var $;
      const p = (($ = e.current) == null ? void 0 : $.getBoundingClientRect().left) ?? 0;
      return f - p;
    },
    [e]
  ), d = H(
    (f, p, $) => {
      if (i || c != null && c.has(f)) return;
      const h = D(f);
      h && ($.target.setPointerCapture($.pointerId), $.preventDefault(), I.current = {
        startClientX: $.clientX,
        originalBar: { ...h },
        mode: p,
        taskId: f,
        activated: !1
      }, A.current = !1);
    },
    [i, c, D]
  ), L = H(
    (f) => {
      const p = I.current;
      if (!p) return;
      const $ = f.clientX - p.startClientX, { originalBar: h, mode: N, taskId: E } = p;
      if (!p.activated) {
        if (Math.abs($) < Ct) return;
        if (p.activated = !0, A.current = !0, S(!0), w.current = {
          taskId: E,
          mode: N,
          originalBar: h,
          ghostBar: { ...h },
          ghostProgress: h.progress
        }, N !== "progress" && s.current) {
          const y = s.current;
          y.style.display = "", y.setAttribute("x", String(h.x)), y.setAttribute("y", String(h.y)), y.setAttribute("width", String(h.width)), y.setAttribute("height", String(h.height)), y.setAttribute("fill", h.color);
        }
      }
      const Q = w.current;
      if (!Q) return;
      const M = { ...Q.originalBar };
      let F = Q.originalBar.progress;
      switch (N) {
        case "move":
          M.x = h.x + $;
          break;
        case "resize-left": {
          const y = h.x + $, T = h.width - $;
          T >= K ? (M.x = y, M.width = T) : (M.x = h.x + h.width - K, M.width = K);
          break;
        }
        case "resize-right": {
          const y = h.width + $;
          M.width = Math.max(y, K);
          break;
        }
        case "progress": {
          const U = (R(f.clientX) - h.x) / h.width * 100;
          F = Math.round(Math.max(0, Math.min(100, U)));
          break;
        }
      }
      if (w.current = { ...Q, ghostBar: M, ghostProgress: F }, N !== "progress" && s.current) {
        const y = s.current;
        y.setAttribute("x", String(M.x)), y.setAttribute("y", String(M.y)), y.setAttribute("width", String(M.width)), y.setAttribute("height", String(M.height));
      }
      if (N === "progress" && e.current) {
        const y = e.current.querySelector(
          `[data-progress-task="${E}"]`
        ), T = e.current.querySelector(
          `[data-progress-handle="${E}"]`
        ), U = h.width * (F / 100);
        if (y) {
          const J = h.width - U;
          y.setAttribute(
            "clip-path",
            `inset(0 ${J}px 0 0)`
          ), y.style.display = F > 0 ? "" : "none";
        }
        T && T.setAttribute(
          "cx",
          String(h.x + U)
        );
      }
    },
    [R, s, e]
  ), W = H(
    (f) => {
      const p = I.current;
      if (!p || (f.target.releasePointerCapture(f.pointerId), I.current = null, !p.activated))
        return;
      const $ = w.current;
      if (w.current = null, s.current && (s.current.style.display = "none"), S(!1), !$) return;
      const { mode: h, taskId: N, ghostBar: E, ghostProgress: Q } = $;
      queueMicrotask(() => {
        if (h === "progress") {
          x == null || x({ taskId: N, progress: Q });
          return;
        }
        if ($.originalBar.kind === "milestone") {
          const y = E.x + E.width / 2, T = et(
            tt(y, n, a, o),
            o
          );
          l == null || l({ taskId: N, start: T, end: T });
          return;
        }
        const M = et(
          tt(E.x, n, a, o),
          o
        ), F = et(
          tt(E.x + E.width, n, a, o),
          o
        );
        h === "move" ? l == null || l({ taskId: N, start: M, end: F }) : k == null || k({ taskId: N, start: M, end: F });
      });
    },
    [n, a, o, l, k, x, s]
  ), b = H(
    (f, p) => d(f, "move", p),
    [d]
  ), m = H(
    (f, p) => d(f, "resize-left", p),
    [d]
  ), v = H(
    (f, p) => d(f, "resize-right", p),
    [d]
  ), B = H(
    (f, p) => d(f, "progress", p),
    [d]
  ), _ = H(() => {
    A.current = !1;
  }, []);
  return {
    isDragging: P,
    didDrag: A.current,
    clearDidDrag: _,
    handleMoveStart: b,
    handleResizeLeftStart: m,
    handleResizeRightStart: v,
    handleProgressStart: B,
    handlePointerMove: L,
    handlePointerUp: W
  };
}
function Et({
  columns: t,
  columnWidth: e,
  height: s,
  scrollLeft: r,
  taskListWidth: n
}) {
  return /* @__PURE__ */ G("div", { className: "gantt-header", style: { height: s }, children: [
    n > 0 && /* @__PURE__ */ g(
      "div",
      {
        className: "gantt-header-cell gantt-header-cell--task-list",
        style: { width: n, height: s },
        children: "Tasks"
      }
    ),
    /* @__PURE__ */ g("div", { className: "gantt-header-dates", style: { overflow: "hidden", flex: 1 }, children: /* @__PURE__ */ g(
      "div",
      {
        style: {
          display: "flex",
          transform: `translateX(-${r}px)`
        },
        children: t.map((a) => /* @__PURE__ */ g(
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
const Ht = 60, nt = 8, Bt = 5;
function Ot({
  bar: t,
  readOnly: e,
  disabled: s,
  onClick: r,
  onDoubleClick: n,
  onMoveStart: a,
  onResizeLeftStart: o,
  onResizeRightStart: i,
  onProgressStart: c,
  didDrag: l,
  clearDidDrag: k
}) {
  const P = !e && !s && !t.isSummary, S = (D) => {
    if (l) {
      k == null || k(), D.stopPropagation();
      return;
    }
    r == null || r(t.taskId);
  }, w = () => {
    l || n == null || n(t.taskId);
  }, I = [
    "gantt-bar-group",
    P && "gantt-bar-group--interactive",
    s && "gantt-bar-group--disabled",
    t.isSummary && "gantt-bar-group--summary",
    t.critical && "gantt-bar-group--critical",
    t.kind === "milestone" && "gantt-bar-group--milestone"
  ].filter(Boolean).join(" ");
  if (t.kind === "milestone") {
    const D = t.x + t.width / 2, R = t.y + t.height / 2, d = [
      `${D},${t.y}`,
      `${t.x + t.width},${R}`,
      `${D},${t.y + t.height}`,
      `${t.x},${R}`
    ].join(" ");
    return /* @__PURE__ */ G(
      "g",
      {
        className: I,
        onClick: S,
        onDoubleClick: w,
        children: [
          /* @__PURE__ */ g(
            "polygon",
            {
              className: "gantt-milestone",
              points: d,
              fill: t.color,
              onPointerDown: P ? (L) => a == null ? void 0 : a(t.taskId, L) : void 0
            }
          ),
          /* @__PURE__ */ g(
            "text",
            {
              className: "gantt-milestone-label",
              x: t.x + t.width + 6,
              y: R,
              children: t.name
            }
          )
        ]
      }
    );
  }
  const A = t.width * (t.progress / 100);
  return /* @__PURE__ */ G(
    "g",
    {
      className: I,
      onClick: S,
      onDoubleClick: w,
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
            onPointerDown: P ? (D) => a == null ? void 0 : a(t.taskId, D) : void 0
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
            clipPath: `inset(0 ${t.width - A}px 0 0)`
          }
        ),
        t.width > Ht && /* @__PURE__ */ g(
          "text",
          {
            className: "gantt-bar-label",
            x: t.x + t.width / 2,
            y: t.y + t.height / 2,
            children: t.name
          }
        ),
        P && /* @__PURE__ */ G($t, { children: [
          /* @__PURE__ */ g(
            "rect",
            {
              className: "gantt-bar-resize-handle",
              x: t.x,
              y: t.y,
              width: nt,
              height: t.height,
              rx: 4,
              ry: 4,
              onPointerDown: (D) => {
                D.stopPropagation(), o == null || o(t.taskId, D);
              }
            }
          ),
          /* @__PURE__ */ g(
            "rect",
            {
              className: "gantt-bar-resize-handle",
              x: t.x + t.width - nt,
              y: t.y,
              width: nt,
              height: t.height,
              rx: 4,
              ry: 4,
              onPointerDown: (D) => {
                D.stopPropagation(), i == null || i(t.taskId, D);
              }
            }
          ),
          /* @__PURE__ */ g(
            "circle",
            {
              className: "gantt-bar-progress-handle",
              "data-progress-handle": t.taskId,
              cx: t.x + A,
              cy: t.y + t.height / 2,
              r: Bt,
              onPointerDown: (D) => {
                D.stopPropagation(), c == null || c(t.taskId, D);
              }
            }
          )
        ] })
      ]
    }
  );
}
const _t = 16;
function Rt({ expanded: t }) {
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
function Wt({
  rows: t,
  width: e,
  rowHeight: s,
  totalHeight: r,
  onToggleCollapse: n
}) {
  return e <= 0 ? null : /* @__PURE__ */ g(
    "div",
    {
      className: "gantt-task-list",
      style: { width: e, minHeight: r },
      role: "list",
      children: t.map((a) => {
        const o = a.type === "group" ? a.groupId : a.taskId, i = a.level * _t;
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
              a.type === "group" && a.color && /* @__PURE__ */ g(
                "div",
                {
                  className: "gantt-task-list-accent",
                  style: { backgroundColor: a.color }
                }
              ),
              /* @__PURE__ */ g("div", { style: { width: i, flexShrink: 0 } }),
              a.hasChildren ? /* @__PURE__ */ g("span", { className: "gantt-task-list-toggle", children: /* @__PURE__ */ g(Rt, { expanded: !a.isCollapsed }) }) : /* @__PURE__ */ g("div", { className: "gantt-task-list-toggle-spacer" }),
              /* @__PURE__ */ g("span", { className: "gantt-task-list-name", title: a.name, children: a.name })
            ]
          },
          a.id
        );
      })
    }
  );
}
const O = 5, C = 12;
function Ft(t, e = 4) {
  const s = t.sourceLeft + t.sourceWidth, r = t.targetLeft + t.targetWidth, n = t.sourceTop + t.sourceHeight / 2, a = t.targetTop + t.targetHeight / 2;
  switch (t.type) {
    case "FS":
      return Gt(t, s, n, a, e);
    case "SS":
      return jt(t, n, a, e);
    case "FF":
      return bt(s, r, n, a, e);
    case "SF":
      return Qt(t, r, n, a, e);
  }
}
function ct(t, e) {
  return [
    `${t - O},${e - O}`,
    `${t},${e}`,
    `${t - O},${e + O}`
  ].join(" ");
}
function lt(t, e) {
  return [
    `${t + O},${e - O}`,
    `${t},${e}`,
    `${t + O},${e + O}`
  ].join(" ");
}
function Gt(t, e, s, r, n) {
  const a = ct(t.targetLeft, r), o = t.targetLeft - O;
  if (t.targetLeft - e > C * 2)
    return Ut(e, s, o, r, e + C, n, a);
  const i = dt(t);
  return gt(
    e,
    s,
    "right",
    o,
    r,
    "left",
    e + C,
    t.targetLeft - C,
    i,
    n,
    a
  );
}
function jt(t, e, s, r) {
  const n = ct(t.targetLeft, s), a = t.targetLeft - O, o = Math.min(t.sourceLeft, t.targetLeft) - C;
  return ht(
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
function bt(t, e, s, r, n) {
  const a = lt(e, r), o = e + O, i = Math.max(t, e) + C;
  return ht(
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
function Qt(t, e, s, r, n) {
  const a = lt(e, r), o = e + O;
  if (t.sourceLeft - e > C * 2)
    return zt(t.sourceLeft, s, o, r, t.sourceLeft - C, n, a);
  const i = dt(t);
  return gt(
    t.sourceLeft,
    s,
    "left",
    o,
    r,
    "right",
    t.sourceLeft - C,
    e + C,
    i,
    n,
    a
  );
}
function dt(t) {
  const e = t.sourceTop + t.sourceHeight, s = t.targetTop + t.targetHeight;
  return Math.max(e, s) + t.rowHeight * 0.4;
}
function Ut(t, e, s, r, n, a, o) {
  const i = r - e;
  if (Math.abs(i) < 1)
    return { path: `M ${t},${e} L ${s},${r}`, arrowHead: o };
  const c = Math.min(a, Math.abs(i) / 2, C / 2), l = i > 0 ? 1 : -1;
  return { path: [
    `M ${t},${e}`,
    `L ${n - c},${e}`,
    `Q ${n},${e} ${n},${e + c * l}`,
    `L ${n},${r - c * l}`,
    `Q ${n},${r} ${n + c},${r}`,
    `L ${s},${r}`
  ].join(" "), arrowHead: o };
}
function zt(t, e, s, r, n, a, o) {
  const i = r - e;
  if (Math.abs(i) < 1)
    return { path: `M ${t},${e} L ${s},${r}`, arrowHead: o };
  const c = Math.min(a, Math.abs(i) / 2, C / 2), l = i > 0 ? 1 : -1;
  return { path: [
    `M ${t},${e}`,
    `L ${n + c},${e}`,
    `Q ${n},${e} ${n},${e + c * l}`,
    `L ${n},${r - c * l}`,
    `Q ${n},${r} ${n - c},${r}`,
    `L ${s},${r}`
  ].join(" "), arrowHead: o };
}
function ht(t, e, s, r, n, a, o, i, c) {
  const l = n - e, k = Math.min(i, Math.max(Math.abs(l) / 2, 1), C / 2), x = l >= 0 ? 1 : -1, P = s === "left" ? -1 : 1, S = a === "left" ? 1 : -1;
  return { path: [
    `M ${t},${e}`,
    // Horizontal from start toward the column (stop short to leave room for curve)
    `L ${o - P * k},${e}`,
    // Curve into vertical
    `Q ${o},${e} ${o},${e + k * x}`,
    // Vertical segment to target row
    `L ${o},${n - k * x}`,
    // Curve out of vertical
    `Q ${o},${n} ${o + S * k},${n}`,
    // Horizontal to end
    `L ${r},${n}`
  ].join(" "), arrowHead: c };
}
function gt(t, e, s, r, n, a, o, i, c, l, k) {
  const x = Math.min(l, C / 2), P = s === "left" ? -1 : 1, S = a === "left" ? 1 : -1, w = i > o ? 1 : -1;
  return { path: [
    `M ${t},${e}`,
    // Horizontal from source anchor to startColX
    `L ${o - P * x},${e}`,
    // Curve into vertical (going down toward detour)
    `Q ${o},${e} ${o},${e + x}`,
    // Vertical down to detour row
    `L ${o},${c - x}`,
    // Curve into horizontal toward endColX
    `Q ${o},${c} ${o + w * x},${c}`,
    // Horizontal across detour row
    `L ${i - w * x},${c}`,
    // Curve into vertical (going up toward target row)
    `Q ${i},${c} ${i},${c - x}`,
    // Vertical up to target row
    `L ${i},${n + x}`,
    // Curve into horizontal toward target anchor
    `Q ${i},${n} ${i + S * x},${n}`,
    // Final horizontal to arrowhead
    `L ${r},${n}`
  ].join(" "), arrowHead: k };
}
function qt({ dependencies: t, bars: e, rowHeight: s }) {
  const r = st(() => {
    const n = /* @__PURE__ */ new Map();
    for (const o of e)
      n.set(o.taskId, o);
    const a = [];
    for (const o of t) {
      const i = n.get(o.fromTaskId), c = n.get(o.toTaskId);
      if (!i || !c) continue;
      const l = Ft({
        sourceLeft: i.x,
        sourceTop: i.y,
        sourceWidth: i.width,
        sourceHeight: i.height,
        targetLeft: c.x,
        targetTop: c.y,
        targetWidth: c.width,
        targetHeight: c.height,
        rowHeight: s,
        type: o.type
      });
      a.push({
        key: `${o.fromTaskId}->${o.toTaskId}:${o.type}`,
        path: l.path,
        arrowHead: l.arrowHead
      });
    }
    return a;
  }, [t, e, s]);
  return r.length === 0 ? null : /* @__PURE__ */ g("g", { className: "gantt-dependencies-layer", children: r.map((n) => /* @__PURE__ */ G("g", { children: [
    /* @__PURE__ */ g("path", { className: "gantt-arrow-path", d: n.path }),
    /* @__PURE__ */ g("polygon", { className: "gantt-arrow-head", points: n.arrowHead })
  ] }, n.key)) });
}
const Zt = {
  day: 50,
  week: 80,
  month: 120
}, Vt = 50, Jt = 40, Kt = 0.8;
function te(t) {
  const {
    tasks: e,
    dependencies: s = [],
    groups: r = [],
    viewMode: n = "week",
    taskListWidth: a = 0,
    rowHeight: o = Vt,
    columnWidth: i,
    readOnly: c = !1,
    showDependencies: l = !0,
    showTodayMarker: k = !0,
    theme: x,
    locale: P,
    initialCollapsed: S,
    onTaskClick: w,
    onTaskDoubleClick: I,
    onTaskMove: A,
    onTaskResize: D,
    onProgressChange: R
  } = t, d = i ?? Zt[n], { collapsedIds: L, toggleCollapse: W } = vt(S), { containerRef: b, scrollLeft: m, handleScroll: v } = Pt(), B = Mt(
    e,
    r,
    n,
    o,
    d,
    L,
    P
  ), { rows: _, bars: f, columns: p, timeRange: $, totalWidth: h, totalHeight: N } = B, E = N + o * Kt, Q = (u) => {
    if (u.startsWith("group-summary-")) {
      const mt = u.replace("group-summary-", "");
      W(mt);
    } else
      w == null || w(u);
  }, M = Z(null), F = Z(null), y = st(
    () => new Set(e.filter((u) => u.disabled).map((u) => u.id)),
    [e]
  ), T = At({
    svgRef: M,
    ghostRectRef: F,
    bars: f,
    timeRange: $,
    columnWidth: d,
    viewMode: n,
    readOnly: c,
    disabledTaskIds: y,
    onTaskMove: A,
    onTaskResize: D,
    onProgressChange: R
  }), U = /* @__PURE__ */ new Date(), J = q(U, $, d, n), ut = k && U >= $.start && U <= $.end, ft = x ? Object.fromEntries(
    Object.entries(x).filter(([, u]) => u !== void 0)
  ) : {}, pt = [
    "gantt-core",
    T.isDragging && "gantt-core--dragging"
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ G("div", { className: pt, style: ft, children: [
    /* @__PURE__ */ g(
      Et,
      {
        columns: p,
        columnWidth: d,
        height: Jt,
        scrollLeft: m,
        taskListWidth: a
      }
    ),
    /* @__PURE__ */ g("div", { className: "gantt-body", children: /* @__PURE__ */ g(
      "div",
      {
        ref: b,
        className: "gantt-timeline-container",
        onScroll: v,
        children: /* @__PURE__ */ G("div", { className: "gantt-body-inner", style: { width: a + h }, children: [
          /* @__PURE__ */ g(
            Wt,
            {
              rows: _,
              width: a,
              rowHeight: o,
              totalHeight: N,
              onToggleCollapse: W
            }
          ),
          /* @__PURE__ */ G(
            "svg",
            {
              ref: M,
              className: `gantt-svg${c ? "" : " gantt-svg--interactive"}`,
              width: h,
              height: E,
              onPointerMove: T.handlePointerMove,
              onPointerUp: T.handlePointerUp,
              children: [
                /* @__PURE__ */ G("g", { className: "gantt-grid-layer", children: [
                  p.filter((u) => u.isWeekend).map((u) => /* @__PURE__ */ g(
                    "rect",
                    {
                      className: "gantt-weekend-rect",
                      x: u.x,
                      y: 0,
                      width: d,
                      height: N
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
                      y2: N
                    },
                    `line-${u.index}`
                  )),
                  _.map((u) => /* @__PURE__ */ g(
                    "line",
                    {
                      className: "gantt-grid-line",
                      x1: 0,
                      y1: u.y + u.height,
                      x2: h,
                      y2: u.y + u.height
                    },
                    `hline-${u.id}`
                  )),
                  _.filter((u) => u.type === "group").map((u) => /* @__PURE__ */ g(
                    "rect",
                    {
                      className: "gantt-group-row",
                      x: 0,
                      y: u.y,
                      width: h,
                      height: u.height
                    },
                    `group-bg-${u.id}`
                  ))
                ] }),
                l && /* @__PURE__ */ g(
                  qt,
                  {
                    dependencies: s,
                    bars: f,
                    rowHeight: o
                  }
                ),
                /* @__PURE__ */ g("g", { className: "gantt-bars-layer", children: f.map((u) => /* @__PURE__ */ g(
                  Ot,
                  {
                    bar: u,
                    readOnly: c,
                    disabled: y.has(u.taskId),
                    onClick: Q,
                    onDoubleClick: I,
                    onMoveStart: T.handleMoveStart,
                    onResizeLeftStart: T.handleResizeLeftStart,
                    onResizeRightStart: T.handleResizeRightStart,
                    onProgressStart: T.handleProgressStart,
                    didDrag: T.didDrag,
                    clearDidDrag: T.clearDidDrag
                  },
                  u.taskId
                )) }),
                /* @__PURE__ */ g("g", { className: "gantt-ghost-layer", children: /* @__PURE__ */ g(
                  "rect",
                  {
                    ref: F,
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
                    y2: N
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
function it(t) {
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
function ee(t, e = 40) {
  const [s, r, n] = it(t);
  return `#${V(s - e).toString(16).padStart(2, "0")}${V(r - e).toString(16).padStart(2, "0")}${V(n - e).toString(16).padStart(2, "0")}`;
}
function ne(t, e = 40) {
  const [s, r, n] = it(t);
  return `#${V(s + e).toString(16).padStart(2, "0")}${V(r + e).toString(16).padStart(2, "0")}${V(n + e).toString(16).padStart(2, "0")}`;
}
function se(t, e) {
  const [s, r, n] = it(t);
  return `rgba(${s}, ${r}, ${n}, ${e})`;
}
export {
  te as GanttChart,
  Ft as computeArrowPath,
  ee as darkenHex,
  se as hexToRgba,
  ne as lightenHex,
  vt as useGanttTree
};
