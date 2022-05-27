# csvplotter

Plot csv files online with [plotly](https://plotly.com/javascript).

Online demo:
* https://raw.githack.com/mzechmeister/csvplotter/master/csv_plotter.htm?url=../../../plotly/datasets/master/mtcars.csv&cx=2*$%22hp%22&cy=$%22mpg%22&ct=$%22manufacturer%22&cs=$%22mpg%22&pt=$0&cc=%232ca02c&co=0.5&funcf=2400/x%2B10&funcc=%231f77b4&funco=0.9

Features:
* automatic csv file parsing
* drag&drop of file columns
* file and function plotting
* zooming with keyboard keys; rubber band zoom with right-click drag
* everything in javascript (i.e. client side execution)
* shareable via url parameters

Short cuts:
| key | description |
|-----|----|
| <kbd>g</kbd> | toggle grid | 
| <kbd>r</kbd> | ruler |
| <kbd>l</kbd> | logscale for y-axis |
| <kbd>L</kbd> | logscale for x-axis |
| <kbd>+</kbd> | zoom in |
| <kbd>-</kbd> | zoom out |
| <kbd>u</kbd> | reset zoom |
| <kbd>&rightarrow;</kbd> | pan right |
| <kbd>&leftarrow;</kbd> | pan left |
| <kbd>&uparrow;</kbd> | pan up |
| <kbd>&downarrow;</kbd> | pan down |
| <kbd>Home</kbd> | pan left by one page |
| <kbd>End</kbd> | pan right by one page | 
| <kbd>PageUp</kbd> | pan up by one page |
| <kbd>PageDown</kbd> | pan down by one page |
| <kbd>Ctrl</kbd><kbd>&rightarrow;</kbd> | horizontal zoom in |
| <kbd>Ctrl</kbd><kbd>&leftarrow;</kbd> |  horizontal zoom out |
| <kbd>Ctrl</kbd><kbd>&uparrow;</kbd> | vertical zoom in |
| <kbd>Ctrl</kbd><kbd>&downarrow;</kbd> | vertical zoom out |
| <kbd>X</kbd> | horizontal unzoom to global data extremes |
| <kbd>Y</kbd> | vertical unzoom to global data extremes |
| <kbd>U</kbd> | unzoom to global data extremes |
| <kbd>x</kbd> | horizontal unzoom to local data extremes |
| <kbd>y</kbd> | vertical unzoom to local data extremes |
| <kbd>0</kbd> | start y-range to 0|

Tips:
* To join strings, in particular for the tag field, math.js provides the [concat](https://mathjs.org/docs/expressions/syntax.html#strings) and [string](https://mathjs.org/docs/expressions/syntax.html#strings) functions, e.g. `concat(string($"manufacturer"), "<br>", string($"qsec"))`.

Inspired by [gnuplot](http://www.gnuplot.info), [desmos.com](https://www.desmos.com/calculator), and [csvplot.com](https://csvplot.com).
