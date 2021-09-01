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
              axis = graph.layout[key=='L' ? 'xaxis' : 'yaxis'];   // keep format
              [func, axis.type] = (axis.type == 'linear') ? [Math.log10, 'log'] : [(x => 10**x), 'linear'];
              axis['range'] = axis['range'].map(func)   // adjust the range
              Plotly.relayout(graph, {axis}); break;
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

