# csvplotter

Plot csv files online with [plotly](https://plotly.com/javascript).

Online demo:

* [Demo Link](https://raw.githack.com/mzechmeister/csvplotter/master/csv_plotter.htm?url=https://raw.githubusercontent.com/plotly/datasets/master/mtcars.csv&cx=2*$%22hp%22&cy=$%22mpg%22&ct=$%22manufacturer%22&cs=$%22mpg%22&pt=$0&cc=%232ca02c&co=0.5&funcf=2400/x%2B10&funcc=%231f77b4&funco=0.9)

Features:

* Automatic csv file parsing
* Drag & drop of file columns
* File and function plotting
* Zooming with keyboard keys; rubber band zoom with right-click drag
* Everything in javascript (i.e., client-side execution)
* Shareable via URL parameters

## Zooming & Panning

- `Ctrl` + `ArrowRight` / `Ctrl` + `ArrowLeft`: Zoom in/out on the X-axis.
- `Ctrl` + `ArrowUp` / `Ctrl` + `ArrowDown`: Zoom in/out on the Y-axis.
- `+`: Zoom in on both X and Y axes simultaneously.
- `-`: Zoom out on both X and Y axes simultaneously.
- `ArrowRight` / `ArrowLeft`: Pan the view right/left (along the X-axis).
- `ArrowUp` / `ArrowDown`: Pan the view up/down (along the Y-axis).
- `Home`: Pan X-axis to the very beginning (minimum value).
- `End`: Pan X-axis to the very end (maximum value).
- `PageUp`: Pan Y-axis to the very top (maximum value).
- `PageDown`: Pan Y-axis to the very bottom (minimum value).

## Reset & Autoscale Views

- `X`: Reset the X-axis to display the full range of its data.
- `Y`: Reset the Y-axis to display the full range of its data.
- `U`: Reset both X and Y axes to their full data ranges (combines 'X' and 'Y' actions).
- `x`: Autoscale the X-axis to best fit the data within the current Y-axis's visible range.
- `y`: Autoscale the Y-axis to best fit the data within the current X-axis's visible range.
- `u` / `Escape`: Apply Plotly's default autorange behavior to both X and Y axes.

## Axis & Display Manipulation

- `0`: Set the minimum value of both the X-axis and Y-axis to 0.
- `l`: Toggle the Y-axis scale between linear and logarithmic.
- `L`: Toggle the X-axis scale between linear and logarithmic.
- `g`: Toggle the visibility of the grid lines on both axes.
- `r`: Controls the interactive ruler tool. This is a two-stage process:
  1. First `r` press: Arms the ruler.
  2. Second `r` press: Activates dynamic drawing.

## Tips:

* To join strings, in particular for the tag field, math.js provides
  the [concat](https://mathjs.org/docs/expressions/syntax.html#strings)
  and [string](https://mathjs.org/docs/expressions/syntax.html#strings) functions, e.g.,
  `concat(string($"manufacturer"), "<br>", string($"qsec"))`.
* Local files can be loaded by drag & drop to the filename field.
* To send files from the command line,
  see [csv_sent.py](https://gist.github.com/mzechmeister/8bfec277c385c6d72fbc9c8dcedbb2fd).

Inspired by [gnuplot](http://www.gnuplot.info), [desmos.com](https://www.desmos.com/calculator),
and [csvplot.com](https://csvplot.com).
