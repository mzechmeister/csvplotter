function zoompan(){
var graph = document.getElementsByClassName("js-plotly-plot")[0];

var update;

function pan(axis, dx, mode=1) {
    axis += 'axis';
    var [min, max] = graph._fullLayout[axis].range;
    if (typeof min == "string") {
        min = new Date(min).getTime();
        max = new Date(max).getTime();
    }
    dx *= max - min;
    update[axis+'.range'] = [min+dx, max+mode*dx];
}

function panX(dx) {pan('x', dx)}
function panY(dy) {pan('y', dy)}
function zoomX(dx) {pan('x', dx, -1)}
function zoomY(dy) {pan('y', dy, -1)}

function current_extreme(y, x, xbeg, xend) {
    yf = y.filter((yi, i) => xbeg<x[i] & x[i]<xend)
    return [Math.min(...yf), Math.max(...yf)]
}

function clamp(x, x1, x2) {
    return math.min(math.max(x, x1), x2)
}

function trac_mouse(evt) {
    // track coordinates, since they are not available on keyboard events
    x0 = evt.x
    y0 = evt.y
}

graph.tabIndex = 0; // https://stackoverflow.com/questions/3149362/capture-key-press-or-keydown-event-on-div-element
graph.onmouseover = graph.focus   // focus when over, thus no click needed
graph.style.cssText = "resize:both; overflow: auto;" // border: 1px solid; height:250px"


graph.addEventListener("keydown", function(e){
    if (e.target!=this) {return} // e.g. to escape to edittext
    var key = e.key;
    if (e.ctrlKey) key = 'Ctrl+' + key;
    console.log(e, key);
    var fac = 0.1;   // pan and zoom factor
    update = {};
    var extremes = graph._fullData[0]._extremes;  // only first data set
    switch (key) {
        case 'Ctrl+ArrowRight': zoomX(fac); break;
        case 'Ctrl+ArrowLeft': zoomX(-fac); break;
        case 'Ctrl+ArrowUp': zoomY(fac); break;
        case 'Ctrl+ArrowDown': zoomY(-fac); break;
        case '+': zoomX(fac); zoomY(fac); break;
        case '-': zoomX(-fac); zoomY(-fac); break;
        case 'X': case 'U':
             update['xaxis.range'] = [extremes.x.min[0].val, extremes.x.max[0].val];
        case 'Y': case 'U':
             update['yaxis.range'] = [extremes.y.min[0].val, extremes.y.max[0].val]; break;
        case 'x':
             update['xaxis.range'] = [extremes.x.min[0].val, extremes.x.max[0].val];
        case 'y':
             yrange = graph._fullData.map(d => current_extreme(d.y,d.x,...graph._fullLayout.xaxis.range)).reduce((e1,e2) => [Math.min(e1[0],e2[0]), Math.max(e1[1],
 e2[1])]);
             update['yaxis.range'] = yrange; break;
        case 'u':
             update['xaxis.autorange'] = true;
             update['yaxis.autorange'] = true; break;
        case '0': update['yaxis.range[0]'] = 0; break;
        case 'ArrowRight': panX(fac); break;
        case 'ArrowLeft': panX(-fac); break;
        case 'ArrowUp': panY(fac); break;
        case 'ArrowDown': panY(-fac); break;
        case 'Home': panX(-1.); break;
        case 'End': panX(1.); break;
        case 'PageUp': panY(1.); break;
        case 'PageDown': panY(-1.); break;
        case 'l': case 'L':
              // toggle linear and log scale
              axis = graph.layout[key=='L' ? 'xaxis' : 'yaxis'];   // keep format
              [func, axis.type] = (axis.type == 'linear') ? [Math.log10, 'log'] : [(x => 10**x), 'linear'];
              axis['range'] = axis['range'].map(func)   // adjust the range
              update = {axis}
              break;
        case 'g':
              // toggle grid
              var showgrid = graph.layout.yaxis.showgrid == false
              update = {'xaxis.showgrid': showgrid, 'yaxis.showgrid': showgrid}
              break
        case 'r':
              // ruler
              if (!graph.onmousemove || graph.onmousemove!=trac_mouse) {
                  // toggle off
                  graph.onmousemove = trac_mouse
                  update.annotations = []
                  break
              }
              
              var xaxis = graph._fullLayout.xaxis;
              var yaxis = graph._fullLayout.yaxis;
              var l = graph._fullLayout.margin.l;
              var t = graph._fullLayout.margin.t;
              x0 = xaxis.p2c(x0 - l)
              y0 = yaxis.p2c(y0 - t)
              update.annotations = [{
                  x: x0,
                  y: y0,
                  ax: x0,
                  ay: y0,
                  axref: 'x',
                  ayref: 'y',
                  text: '',   // otherwise the head is not shown
                  showarrow: true,
                  arrowwidth: 1,
                  arrowhead: 7
              }]

              graph.onmousemove = function(evt) {
                  mouseX = xaxis.p2c(evt.x - l);
                  mouseY = yaxis.p2c(evt.y - t);
                  mouseX = clamp(mouseX, ...xaxis.range)
                  mouseY = clamp(mouseY, ...yaxis.range)
                  rulertext = `[${x0.toPrecision(7)}, ${y0.toPrecision(7)}] ${mouseX.toPrecision(7)}, ${mouseY.toPrecision(7)}  distance: ${(mouseX-x0).toPrecision(7)}, ${(mouseY-y0).toPrecision(7)}`

                  Plotly.relayout(graph, 
                  {annotations:
                   [{x: x0, y: y0, ax: mouseX, ay: mouseY, axref:'x', ayref:'y', arrowhead: 7, arrowwidth: 1, text: ''},
                    {x: 1, y: 0, ax: 0, ay: 0, xref:'paper', yref:'paper', showarrow: false, xanchor: "right", yanchor: "bottom", text: rulertext}]})
              };
              break
        default: return;
    }

    Plotly.relayout(graph, update);
    return false
});

graph.addEventListener('mousedown', function(evt){
    // hack to pan when pressing middle button/mouse wheel
    // better would be https://github.com/plotly/plotly.js/issues/4004
    this._fullLayout.dragmode = evt.buttons == 4? 'pan' : 'zoom'
}, true);

}

