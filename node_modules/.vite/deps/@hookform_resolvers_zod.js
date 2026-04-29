import { appendErrors, get, set } from "./react-hook-form.js";
//#region node_modules/@hookform/resolvers/dist/resolvers.mjs
var s = (e, s, o) => {
	if (e && "reportValidity" in e) {
		const r = get(o, s);
		e.setCustomValidity(r && r.message || ""), e.reportValidity();
	}
}, o = (t, e) => {
	for (const o in e.fields) {
		const r = e.fields[o];
		r && r.ref && "reportValidity" in r.ref ? s(r.ref, o, t) : r.refs && r.refs.forEach((e) => s(e, o, t));
	}
}, r = (s, r) => {
	r.shouldUseNativeValidation && o(s, r);
	const f = {};
	for (const o in s) {
		const n = get(r.fields, o), a = Object.assign(s[o] || {}, { ref: n && n.ref });
		if (i(r.names || Object.keys(s), o)) {
			const s = Object.assign({}, get(f, o));
			set(s, "root", a), set(f, o, s);
		} else set(f, o, a);
	}
	return f;
}, i = (t, e) => t.some((t) => t.startsWith(e + "."));
//#endregion
//#region node_modules/@hookform/resolvers/zod/dist/zod.mjs
var n = function(r, e) {
	for (var n = {}; r.length;) {
		var t = r[0], s = t.code, i = t.message, a = t.path.join(".");
		if (!n[a]) if ("unionErrors" in t) {
			var u = t.unionErrors[0].errors[0];
			n[a] = {
				message: u.message,
				type: u.code
			};
		} else n[a] = {
			message: i,
			type: s
		};
		if ("unionErrors" in t && t.unionErrors.forEach(function(e) {
			return e.errors.forEach(function(e) {
				return r.push(e);
			});
		}), e) {
			var c = n[a].types, f = c && c[t.code];
			n[a] = appendErrors(a, e, n, s, f ? [].concat(f, t.message) : t.message);
		}
		r.shift();
	}
	return n;
}, t = function(o$1, t, s) {
	return void 0 === s && (s = {}), function(i, a, u) {
		try {
			return Promise.resolve(function(e, n) {
				try {
					var a = Promise.resolve(o$1["sync" === s.mode ? "parse" : "parseAsync"](i, t)).then(function(e) {
						return u.shouldUseNativeValidation && o({}, u), {
							errors: {},
							values: s.raw ? i : e
						};
					});
				} catch (r) {
					return n(r);
				}
				return a && a.then ? a.then(void 0, n) : a;
			}(0, function(r$1) {
				if (function(r) {
					return Array.isArray(null == r ? void 0 : r.errors);
				}(r$1)) return {
					values: {},
					errors: r(n(r$1.errors, !u.shouldUseNativeValidation && "all" === u.criteriaMode), u)
				};
				throw r$1;
			}));
		} catch (r) {
			return Promise.reject(r);
		}
	};
};
//#endregion
export { t as zodResolver };

//# sourceMappingURL=@hookform_resolvers_zod.js.map