const allShortcuts = [
    'Ctrl+ArrowRight', 'Ctrl+ArrowLeft', 'Ctrl+ArrowUp', 'Ctrl+ArrowDown',
    '+', '-', 'X', 'U', 'Y', 'x', 'y', 'u', 'Escape', '0',
    'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown',
    'Home', 'End', 'PageUp', 'PageDown', 'l', 'L', 'g', 'r'
];

/**
 * Enables custom zoom, pan, and other keyboard/mouse interactions for a Plotly plot.
 * @param {HTMLElement} graph - The Plotly graph element.
 * @param {number} [zoomFactor=0.1] - The zoom/pan factor.
 * @param {number} [zoomSpeed=0.1] - The zoom speed.
 * @param {string[]} [enabledShortcuts] - Array of enabled keyboard shortcuts.
 */
const plotlyEnableZoomPan = (
    graph,
    zoomFactor = 1 / 10,
    zoomSpeed = 1 / 20,
    enabledShortcuts = allShortcuts
) => {
    if (!graph) {
        // graphEl was used in the console error message, but the parameter is 'graph'
        console.error("PlotlyEnableZoomPan: Graph element not found:", graph);
        return;
    }

    if (graph.hasZoomPan) return;
    graph.hasZoomPan = true;

    // Encapsulated state for this specific graph instance
    let instance_i0, instance_j0;      // For instanceTracMouse and ruler starting point
    let instance_mousei, instance_mousej; // For ruler's onmousemove and remembering last mouse position

    const zoomFrac = d => d < 0 ? 1 - d * zoomSpeed : 1 / (1 + d * zoomSpeed);
    let update;
    let rubberXAxis, rubberYAxis;
    let rubberClientX0, rubberClientY0;
    let rubberPlotX0, rubberPlotY0;
    let rubberInitialXRange, rubberInitialYRange;

    /**
     * Tracks mouse coordinates for the current graph instance.
     * @param {MouseEvent} evt - The mouse event.
     */
    const instanceTracMouse = (evt) => {
        instance_i0 = evt.x;
        instance_j0 = evt.y;
    };

    const pan = (axis, dx, mode = 1) => {
        axis += 'axis';
        let [min, max] = graph._fullLayout[axis].range;
        if (typeof min == "string") {
            min = new Date(min).getTime();
            max = new Date(max).getTime();
        }
        dx *= max - min;
        update[axis + '.range'] = [min + dx, max + mode * dx];
    };

    const panX = (dx) => { pan('x', dx) };
    const panY = (dy) => { pan('y', dy) };
    const zoomX = (dx) => { pan('x', dx, -1) };
    const zoomY = (dy) => { pan('y', dy, -1) };

    graph.tabIndex = 0;
    graph.onmousedown = () => graph.focus();
    graph.onmouseenter = e => {
        if (!document.activeElement || document.activeElement == document.body) graph.focus();
    };

    const styleTag = document.createElement('style');
    if (graph.id) {
        styleTag.innerHTML = '#' + graph.id + ':focus {outline: auto}';
        document.body.append(styleTag);
    }

    graph.style.resize = "both";
    graph.style.overflow = "auto";

    graph.addEventListener("keydown", (e) => {
        if (e.target != graph) return;
        let key = e.key;
        if (e.ctrlKey) key = 'Ctrl+' + key;

        // Check if the pressed key combination is enabled
        if (!enabledShortcuts.includes(key)) {
            return;
        }

        update = {};

        const extremes = (graph._fullData && graph._fullData[0]) ? graph._fullData[0]._extremes : null;

        if (!extremes && ['X', 'U', 'Y', 'x', 'y'].includes(key)) {
            console.warn("No data loaded or extremes not available, cannot perform zoom/pan operation:", key);
            return;
        }

        switch (key) {
            case 'Ctrl+ArrowRight': zoomX(zoomFactor); break
            case 'Ctrl+ArrowLeft': zoomX(-zoomFactor); break
            case 'Ctrl+ArrowUp': zoomY(zoomFactor); break
            case 'Ctrl+ArrowDown': zoomY(-zoomFactor); break
            case '+': zoomX(zoomFactor); zoomY(zoomFactor); break
            case '-': zoomX(-zoomFactor); zoomY(-zoomFactor); break
            case 'X': case 'U':
                if (extremes && extremes.x && extremes.x.min && extremes.x.min[0] && extremes.x.max && extremes.x.max[0]) {
                    update['xaxis.range'] = [extremes.x.min[0].val, extremes.x.max[0].val];
                }
                if (key == 'X') break;
            case 'Y':
                if (extremes && extremes.y && extremes.y.min && extremes.y.min[0] && extremes.y.max && extremes.y.max[0]) {
                    update['yaxis.range'] = [extremes.y.min[0].val, extremes.y.max[0].val];
                }
                break;
            case 'x':
                if (graph._fullData && graph._fullData.length > 0 && graph._fullLayout.yaxis && graph._fullLayout.yaxis.range) {
                    const xrange = graph._fullData.map(d => currentExtreme(d.x, d.y, ...graph._fullLayout.yaxis.range)).reduce((e1, e2) => [Math.min(e1[0], e2[0]), Math.max(e1[1], e2[1])], [Infinity, -Infinity]);
                    if (isFinite(xrange[0]) && isFinite(xrange[1])) {
                        update['xaxis.range'] = xrange;
                    }
                }
                break;
            case 'y':
                if (graph._fullData && graph._fullData.length > 0 && graph._fullLayout.xaxis && graph._fullLayout.xaxis.range) {
                    const yrange = graph._fullData.map(d => currentExtreme(d.y, d.x, ...graph._fullLayout.xaxis.range)).reduce((e1, e2) => [Math.min(e1[0], e2[0]), Math.max(e1[1], e2[1])], [Infinity, -Infinity]);
                    if (isFinite(yrange[0]) && isFinite(yrange[1])) {
                        update['yaxis.range'] = yrange;
                    }
                }
                break;
            case 'u': case "Escape":
                update['xaxis.autorange'] = true;
                update['yaxis.autorange'] = true;
                break;
            case '0':
                update['xaxis.range[0]'] = 0;
                update['yaxis.range[0]'] = 0;
                break;
            case 'ArrowRight': panX(zoomFactor); break
            case 'ArrowLeft': panX(-zoomFactor); break
            case 'ArrowUp': panY(zoomFactor); break
            case 'ArrowDown': panY(-zoomFactor); break
            case 'Home': panX(-1.); break
            case 'End': panX(1.); break
            case 'PageUp': panY(1.); break
            case 'PageDown': panY(-1.); break
            case 'l': case 'L':
                let func; const axis = graph.layout[key=='L' ? 'xaxis' : 'yaxis'];
                [func, axis.type] = (axis.type == 'linear') ? [Math.log10, 'log'] : [(x => 10**x), 'linear']
                if (axis.range && Array.isArray(axis.range)) { // Ensure range exists and is an array
                    axis.range = axis.range.map(v => {
                        // Add checks for valid numbers before applying func, especially for log
                        if (typeof v === 'number' && isFinite(v)) {
                            if (axis.type === 'log' && v <= 0) {
                                console.warn(`Cannot apply log scale to non-positive value: ${v}`);
                                return v; // Or some other handling like returning a small positive number
                            }
                            return func(v);
                        }
                        return v; // Return original value if not a valid number
                    });
                }
                update = { [key=='L' ? 'xaxis' : 'yaxis']: {...axis} }; // Use computed property name and spread for update
                break
            case 'g':
                const showgrid = graph.layout.yaxis.showgrid == false
                update = {'xaxis.showgrid': showgrid, 'yaxis.showgrid': showgrid}
                break
            case 'r':
                if (!graph.onmousemove || graph.onmousemove != instanceTracMouse) {
                    graph.onmousemove = instanceTracMouse; // Use instance-specific tracMouse
                    update.annotations = []
                    if (instance_mousei !== undefined) { // Check instance_mousei
                        // remember mouse position
                        instance_i0 = instance_mousei;
                        instance_j0 = instance_mousej;
                    }
                    break
                }
                // This part executes if graph.onmousemove IS instanceTracMouse, meaning we start drawing.
                const xaxis = graph._fullLayout.xaxis
                const yaxis = graph._fullLayout.yaxis
                const l = graph._fullLayout.margin.l
                const t = graph._fullLayout.margin.t

                // Ensure instance_i0 and instance_j0 are defined before use
                if (instance_i0 === undefined || instance_j0 === undefined) {
                    console.warn("Ruler start point (instance_i0, instance_j0) is undefined. Move mouse over plot first after pressing 'r'.");
                    // Optionally, you could prevent the ruler from drawing or set a default start point.
                    // For now, it will proceed, and p2c might receive undefined, leading to NaN or errors.
                    // To be safer, one might add: return; or set instance_i0/j0 to a default like event.x/y if available.
                }

                const x0_ruler = xaxis.p2c(instance_i0 - l + window.scrollX) // Use instance_i0
                const y0_ruler = yaxis.p2c(instance_j0 - t + window.scrollY) // Use instance_j0

                update.annotations = [{
                    x: x0_ruler, y: y0_ruler,
                    ax: x0_ruler, ay: y0_ruler,
                    axref: 'x', ayref: 'y',
                    text: '',
                    showarrow: true, arrowwidth: 1, arrowhead: 7
                }]

                // This onmousemove is for drawing the ruler and is specific to this 'graph' instance.
                // It closes over x0_ruler, y0_ruler, xaxis, yaxis, l, t from this 'r' case activation.
                graph.onmousemove = function(evt) { // Using 'function' to maintain original structure, or (evt) => { ... }
                    instance_mousei = evt.x + window.scrollX; // Update instance_mousei
                    instance_mousej = evt.y + window.scrollY - graph.offsetTop; // Update instance_mousej

                    let mouseX = xaxis.p2c(instance_mousei - l); // Use instance_mousei
                    let mouseY = yaxis.p2c(instance_mousej - t); // Use instance_mousej
                    mouseX = clamp(mouseX, ...xaxis.range);
                    mouseY = clamp(mouseY, ...yaxis.range);
                    // x0_ruler and y0_ruler are from the outer scope of this specific ruler activation
                    const rulertext = `[${x0_ruler.toPrecision(7)}, ${y0_ruler.toPrecision(7)}] ${mouseX.toPrecision(7)}, ${mouseY.toPrecision(7)}  distance: ${(mouseX-x0_ruler).toPrecision(7)}, ${(mouseY-y0_ruler).toPrecision(7)}`

                    Plotly.relayout(graph, { annotations: [
                            {x: x0_ruler, y: y0_ruler, ax: mouseX, ay: mouseY, axref:'x', ayref:'y', arrowhead: 7, arrowwidth: 1, text: ''},
                            {x: 1, y: 0, ax: 0, ay: 0, xref:'paper', yref:'paper', showarrow: false, xanchor: "right", yanchor: "bottom", text: rulertext}
                        ]})
                }
                break
        }

        if (update && Object.keys(update).length > 0) {
            Plotly.relayout(graph, update);
        }
        e.preventDefault();
    });

    const rubberInit = (e) => {
        e.stopPropagation();
        const obj = e.currentTarget;

        rubberXAxis = obj._fullLayout.xaxis;
        rubberYAxis = obj._fullLayout.yaxis;
        rubberClientX0 = e.clientX;
        rubberClientY0 = e.clientY;
        const marginLeft = obj._fullLayout.margin && typeof obj._fullLayout.margin.l === 'number' ? obj._fullLayout.margin.l : 0;
        const marginTop = obj._fullLayout.margin && typeof obj._fullLayout.margin.t === 'number' ? obj._fullLayout.margin.t : 0;
        const rect = obj.getBoundingClientRect ? obj.getBoundingClientRect() : {left: 0, top: 0};

        rubberPlotX0 = rubberXAxis.p2c(rubberClientX0 - marginLeft - rect.left);
        rubberPlotY0 = rubberYAxis.p2c(rubberClientY0 - marginTop - rect.top);
        rubberInitialXRange = rubberXAxis.range;
        rubberInitialYRange = rubberYAxis.range;

        obj.onmousemove = rubberZoom;
        obj.onmouseup = () => {
            obj.onmousemove = null;
        };
    };

    const rubberZoom = (e) => {
        const xfrac = zoomFrac(e.clientX - rubberClientX0);
        const yfrac = zoomFrac(-(e.clientY - rubberClientY0));

        const Rx0 = rubberPlotX0 - xfrac * (rubberPlotX0 - rubberXAxis.r2c(rubberInitialXRange[0]));
        const Rx1 = rubberPlotX0 - xfrac * (rubberPlotX0 - rubberXAxis.r2c(rubberInitialXRange[1]));
        const Ry0 = rubberPlotY0 - yfrac * (rubberPlotY0 - rubberYAxis.r2c(rubberInitialYRange[0]));
        const Ry1 = rubberPlotY0 - yfrac * (rubberPlotY0 - rubberYAxis.r2c(rubberInitialYRange[1]));

        Plotly.relayout(e.currentTarget, {
            'xaxis.range': [rubberXAxis.c2r(Rx0), rubberXAxis.c2r(Rx1)],
            'yaxis.range': [rubberYAxis.c2r(Ry0), rubberYAxis.c2r(Ry1)]
        });
    };

    graph.addEventListener('mousedown', (evt) => {
        if (evt.buttons == 4 && graph._fullLayout.dragmode == 'zoom') {
            graph._fullLayout.dragmode = 'pan';
            document.addEventListener('mouseup', (evt_mu) => {
                if (graph && graph._fullLayout) {
                    graph._fullLayout.dragmode = 'zoom';
                }
            }, {'once': true});
        }
        if (evt.buttons == 2) rubberInit(evt);
    }, true);
};

/**
 * Calculates the minimum and maximum y-values within a specified x-range.
 * Handles cases where x or y data might be undefined by using array indices.
 * @param {number[]} y - The array of y-values.
 * @param {number[]} [x] - The array of x-values. If undefined, indices of y are used.
 * @param {number} xbeg - The beginning of the x-range (exclusive).
 * @param {number} xend - The end of the x-range (exclusive).
 * @returns {number[]} An array containing [minY, maxY] within the filtered range.
 */
const currentExtreme = (y, x, xbeg, xend) => {
    if (x == undefined) x = y.map((yi, i) => i);  // row number (happens in plotly for empty x or y data)
    else if (y == undefined) y = x.map((yi, i) => i);
    const yf = y.filter((yi, i) => xbeg < x[i] & x[i] < xend & isFinite(yi));
    return [Math.min(...yf), Math.max(...yf)];
};

/**
 * Clamps a value between a minimum and maximum.
 * @param {number} x - The value to clamp.
 * @param {number} x1 - The minimum value.
 * @param {number} x2 - The maximum value.
 * @returns {number} The clamped value.
 */
const clamp = (x, x1, x2) => {
    return Math.min(Math.max(x, x1), x2);
};