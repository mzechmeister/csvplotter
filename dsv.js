async function dsv(file, ...args){
    if (typeof file == "string") {
        // nothing needed if file is instanceof File
        var file = await fetch(file);
    }
    var responseText = await file.text()
    if (responseText.length) {
        responseText.__proto__._url = file.name || file.url
        text_to_table(responseText, ...args)
    }
}

function auto_colnames(data){
    // check for a header row (no numbers) and convert it to column names
    colnames = data.map(d => d[0])
    data._colnames = colnames   // null
    all_text = colnames.every(x => isNaN(Number(x)))   // check if there is any number
    if (all_text) {
        data._colnames = colnames
        for (var i=0; i<colnames.length; i += 1) {
            data[i].shift()   // remove headline
            data[colnames[i]] = data[i]   // data can be now index by column number or column name
        }
    }
    else {
        data._colnames = [...data.keys()].map((_, i) => i+1)   // one based indexing
    }
    data.unshift([...Array(data[0].length).keys()])  // prepend a column 0 with row numbers
    console.log(colnames)
}

function text_to_table(text, func, delim){
   // guess the delimiter if not given
   lines = text.split("\n");
   if (delim) {}
   else if (lines[0].split(";").length > 1) {delim = ";"}
   else if (lines[0].split(",").length > 1) {delim = ","}
   else if (lines[0].split(RegExp(" +")).length > 1) {delim = RegExp(" +")}
   console.log("delim:", delim)
   data = lines.map(x => x.split(delim));
   // transpose
   data = data[0].map((_,k) => data.map(hjk => ""+hjk[k]))
   auto_colnames(data)
   data._url = text._url
   data._basename = text._url.split('/').pop()
   func(data)
}

