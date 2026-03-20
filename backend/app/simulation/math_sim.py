"""
math_sim.py — Math simulation (function plotting, derivatives, integrals)
Safe version: works without sympy or numpy
Copy to: backend/app/simulation/math_sim.py
"""
import math

try:
    import sympy as sp
    HAS_SYMPY = True
except ImportError:
    HAS_SYMPY = False

try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False


def _linspace(start, stop, n):
    if HAS_NUMPY:
        return list(np.linspace(start, stop, n))
    step = (stop - start) / (n - 1) if n > 1 else 0
    return [start + i * step for i in range(n)]


def _eval_expr(expression: str, x_val: float) -> float:
    """Safely evaluate a math expression at a point."""
    try:
        safe_expr = (expression
            .replace("^", "**")
            .replace("sin", "math.sin").replace("cos", "math.cos")
            .replace("tan", "math.tan").replace("sqrt", "math.sqrt")
            .replace("log", "math.log").replace("exp", "math.exp")
            .replace("abs", "abs").replace("pi", "str(math.pi)")
            .replace("e", "math.e")
        )
        # Fix "math.e**" style conflicts
        safe_expr = safe_expr.replace("math.exp_math", "math.exp")
        result = eval(safe_expr, {"__builtins__": {}}, {"math": math, "x": x_val})
        return float(result)
    except Exception:
        return float("nan")


def _numerical_deriv(expr: str, x: float, h: float = 1e-5) -> float:
    return (_eval_expr(expr, x + h) - _eval_expr(expr, x - h)) / (2 * h)


def function_plot(variables: dict) -> dict:
    expression = variables.get("expression") or "x**2"
    x_min = float(variables.get("x_min") or -10)
    x_max = float(variables.get("x_max") or 10)

    x_vals = _linspace(x_min, x_max, 200)
    points        = []
    deriv_points  = []

    for xv in x_vals:
        yv = _eval_expr(expression, xv)
        if math.isfinite(yv) and abs(yv) < 1e6:
            points.append({"x": round(xv, 4), "y": round(yv, 4)})

        dv = _numerical_deriv(expression, xv)
        if math.isfinite(dv) and abs(dv) < 1e6:
            deriv_points.append({"x": round(xv, 4), "y": round(dv, 4)})

    # Get symbolic info if sympy available
    deriv_str    = "f'(x) (numerical)"
    integral_str = "∫f(x)dx (numerical)"

    if HAS_SYMPY:
        try:
            x_sym    = sp.Symbol("x")
            expr_sym = sp.sympify(expression.replace("^", "**"))
            deriv_sym    = sp.diff(expr_sym, x_sym)
            integral_sym = sp.integrate(expr_sym, x_sym)
            deriv_str    = str(deriv_sym)
            integral_str = str(integral_sym) + " + C"
        except Exception:
            pass

    # Roots (zero crossings)
    roots = []
    for i in range(len(points) - 1):
        y0, y1 = points[i]["y"], points[i+1]["y"]
        if y0 * y1 < 0:
            # linear interpolation
            xr = points[i]["x"] - y0 * (points[i+1]["x"] - points[i]["x"]) / (y1 - y0)
            roots.append(round(xr, 4))

    return {
        "type":            "function_plot",
        "points":          points,
        "derivative_points": deriv_points,
        "roots":           roots,
        "stats": {
            "expression": expression,
            "derivative": deriv_str,
            "integral":   integral_str,
            "x_range":    [x_min, x_max],
            "n_roots":    len(roots),
        }
    }