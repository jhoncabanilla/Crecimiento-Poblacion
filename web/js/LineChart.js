/**
 * @file Archivo sobre la pestaña 2 que trata el line chart
 * @author Jhon Steeven Cabanilla Alvarado
 */

 const COLORES = { "Least Developed Countries": '#ff7f00', "Less Developed Regions": '#e41a1c', "More Developed Regions": '#377eb8',
 "Low-income countries": "#fcea0c", "Lower-middle-income countries": "#a8fc0c", "Middle-income countries": "#0cfcd8", "Upper-middle-income countries": "#000080", "High income countries": "#fc0c75"}

 /**
  * Selecciona los datos de unas regiones en concreto
  * @param {JSON} data Datos de los que se quiere obtener el subconjunto
  * @param {String[]} provincias Región a seleccionar de los datos
  */
  function seleccionarDatosRegion(data, regiones) {
    var dataSelec = [];
    data.forEach(function (d) {

        if(regiones.includes(d.Entity)) {
            dataSelec.push(d);
        }
    })
    return dataSelec;
}

 /**
  * Animaciones del linechart, para que se vayan mostrando las líneas gradualmente de izquierda a derecha
  * @param {*} path 
  */
 function transition(path) {
     path.transition()
         .duration(4000)
         .attrTween("stroke-dasharray", tweenDash)
         .on("end", () => { d3.select(this).call(transition); });
 }
 
 function tweenDash() {
     if (this instanceof Window)
         return;
     const l = this.getTotalLength(),
         i = d3.interpolateString("0," + l, l + "," + l);
     return function (t) { return i(t) };
 }

/**
 * Dibuja el gráfico de la pestaña 2, correspondiente al line chart
 * @param {String[]} regiones Regiones de las cuales se quiere ver el gráfico
 * @param {int} tipotasa Para elegir una medida para representar el tasa(porcentaje)
 */
function dibujarGrafico(regiones, tipotasa){

    d3.csv("desarrolloRegiones.csv").then(function (data) {

        var margin = {top: 30, right: 30, bottom: 70, left: 120 },
            width = window.innerWidth - 500 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        var parseYear = d3.timeParse("%Y");

        //Tratamiento de datos
        data.forEach(function (d) {
            d.Year = parseYear(d.Year);
            if(tipotasa == 0){
                //En el caso de que sea igual 0, se trata de la medida Population Growth ya que este fue el valor que se le establecio en el html
                d.TasaMigracion = +d.TasaMigracion;
            } else{
                d.TasaMigracion = +d.TasaNoMigracion;
            }
            
        })

        var dataSel = seleccionarDatosRegion(data, regiones);

        //svg del grafico
        var svg_2 = d3.select("#serie")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        //Agrupamos los datos de tal manera que nos quede una line por region
        //Para ello utilizamos d3.nest, que hay que importarlo aparte {https://d3js.org/d3-collection.v1.min.js}
        var agrupados = d3.nest() 
            .key(function (d) {return d.Entity; })
            .entries(dataSel);


        //Añadimos el eje X, el cual es un dato de fechas -> Años desde 1950 hasta 2019
        var x = d3.scaleTime()
            .domain(d3.extent(data, function(d) {return d.Year }))
            .rangeRound([0, width]);

        svg_2.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")).ticks(15))


        //Añadimos el eje Y que representa los porcentajes de las tasas
        var y = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) {return +d.TasaMigracion; })])
            .range([height, 0]);

        svg_2.append("g")
            .call(d3.axisLeft(y));


        //Dibujamos las lineas
        svg_2.selectAll(".line")
            .data(agrupados)
            .enter()
            .append("path")
            .call(transition) //animacion
            .attr("fill", "none")
            .attr("stroke", function (d) {return COLORES[d.key] }) //Elegimos los mismos colores
            .attr("stroke-width", 1.5)
            .attr("d", function (d) {
                return d3.line()
                    .x(function (d) {return x(d.Year); })
                    .y(function (d) {return y(d.TasaMigracion); })
                    (d.values)
            });

        
        //Añadimos el grid del eje Y
        svg_2.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(y)
                .tickSize(-width)
                .tickFormat("")
            );


        //Creamos el tooltip que nos mostrara la tasa correspondiente de un año al pasar el mouse por un cierto punto
        var tooltip = d3.select("body").append("div")
            .attr("class", "puntosSerie")
            .style("opacity", 0);

        var region = svg_2.selectAll(".region")
            .data(agrupados)
            .enter().append("g")
            .attr("class", "region");


        //Añadimos los puntos
        region.selectAll("circle")
            .data(function (d) {return d.values })
            .enter()
            .append("circle")
            .attr("r", 3)
            .attr("cx", function (d) {return x(d.Year); })
            .attr("cy", function (d) {return y(d.TasaMigracion); })
            .style("fill", function (d) {return COLORES[d.Entity]; })

            //Cuado se pase por encima, mostramos las etiquetas de los puntos y los hacemos grandes
            .on("mouseover", function(event) {
                d3.select(this).transition()
                    .duration('100')
                    .attr("r", 6);
                tooltip.transition()
                    .duration(100)
                    .style("opacity", 1);
                tooltip.html(d3.format(".2f")(this.__data__.TasaMigracion) + (" %"))
                    .style("top", (event.pageX + 10))
                    .style("right", (event.pageY + 50))
                    .style("background", COLORES[this.__data__.Entity]);
            })
            //Cuando se quite el puntero, quitamos las etiquetas que sean visibles y restablecemos el tamaño del punto
            .on("mouseout", function() {

                d3.select(this).transition()
                    .duration('200')
                    .attr("r", 3);

                //Desaparecer el tooltip
                tooltip.transition()
                    .duration(100)
                    .style("opacity", 0)
            });
    })

}