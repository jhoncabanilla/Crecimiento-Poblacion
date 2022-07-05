
/**
 * @file Archivo sobre la pestaña principal que trata el Mapa de Coropletas
 * @author Jhon SteeveN Cabanilla Alvarado
 */

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const FONT = "Times New Roman";


/**
 * Funcion que dibuja el mapa global mediante un archivo JSON
 */
function dibujarMapa(){

    //svg del Mapa
    let svg = d3.select("#grafico")
        .append("svg")
        .attr("width",WIDTH)
        .attr("height",HEIGHT+50);

    svg.append("defs").append("style").text("font-family: Times New Roman, Times, serif");

    //svg de la Leyenda del mapa
    let svgLeyenda = d3.select("#Leyenda")
        .append("svg")
        .attr("width", document.getElementById('Leyenda').clientWidth-100)
        .attr("height", document.getElementById('Leyenda').clientHeight);


    //Cargamos los datos a utilizar
    let tasaDATA = d3.csv("tasamigracion.csv");
    let birthsDATA = d3.csv("number-of-births-per-year.csv");
    let deathsDATA = d3.csv("number-of-deaths-per-year.csv");
    let mapData = d3.json("custom.geo.json");


    //Mediante el metodo Promise.all(), obtenemos una promesa que termina correctamente cuando todas las promesas en el argumento iterable han sido concluidas
    //con exito
    Promise.all([tasaDATA,birthsDATA,deathsDATA,mapData])
    .then((data)=>{

        //Asignamos los valores correspondientes
        let tasaDATA = data[0];
        let birthsDATA = data[1];
        let deathsDATA = data[2];
        let mapData = data[3];
        let features = mapData.features;

        let mode = "Population growth"; //Establecemos este modo por defecto para que se muestre la tasa de crecimiento con migracion
        let year = "1989"; //Establecemos un año cualquiere para iniciar


        let colors = updateYear(features,tasaDATA,birthsDATA,deathsDATA,year);
        colorTasaC = colors[0];
        colorTasaS = colors[1];
        colorBirths = colors[2];
        colorDeaths = colors[3];


        let projection = d3.geoNaturalEarth1().fitExtent([[0,40],[WIDTH-30,HEIGHT-70]],mapData);
        let geoPath = d3.geoPath(projection);

     
        //Procedemos a implementar el 'zoom'
        let zoom = d3.zoom();
        let map = svg
            .append("g")
            .call(zoom.on("zoom",()=>{
                map.attr("transform",d3.event.transform);
            }));
        
        map.append("rect")
        .style("fill","white")
        .attr("x","0")
        .attr("y","0")
        .attr("width",WIDTH)
        .attr("height",HEIGHT);
        
        //Damos color al mapa
        map.selectAll(".country")
            .data(features)
            .enter()
            .append("path")
            .attr("class","country")
            .attr("d",geoPath)
            .style("stroke","black")
            .style("fill",(data)=>{
                return colorTasaC(data.properties.TasaMigration || 0);
            })
            .on("mouseover",mouseOver);


        //Damos colores a la leyenda del mapa
        var def = svgLeyenda.append("defs");
        var gradiente = def.append("linearGradient")
            .attr("id", "gradiente");

        gradiente.append("stop")
            .attr("offset", 0)
            .attr("stop-color", "yellow");

        gradiente.append("stop")
            .attr("offset", 10)
            .attr("stop-color", "red");

        svgLeyenda.append("rect")
            .attr("x", "0")
            .attr("y", "0")
            .attr("width", document.getElementById('Leyenda').clientWidth*.7)
            .attr("height", document.getElementById('Leyenda').clientHeight*.2)
            .style("fill", "url(#gradiente)")
            .attr("stroke", "black");

        
        //Variables que se muestran en la esquina superior izquierda
        countryName = svg.append("text")
            .attr("id","name")
            .attr("x","10")
            .attr("y","30")
            .style("fill","black")
            .style("font-family",FONT)
            .style("font-weight","bold")
            .text("");
        
        tasaMigraText = svg.append("text")
            .attr("id","tasaMigracion")
            .attr("x","10")
            .attr("y","50")
            .style("fill","black")
            .style("font-family",FONT)
            .text("");

        tasaNoMigraText = svg.append("text")
            .attr("id","tasaNoMigracion")
            .attr("x","10")
            .attr("y","80")
            .style("fill","black")
            .style("font-family",FONT)
            .text("");

        nacimientosText = svg.append("text")
            .attr("id","nacimientos")
            .attr("x","10")
            .attr("y","110")
            .style("fill","black")
            .style("font-family",FONT)
            .text("");

        fallecimientosText = svg.append("text")
            .attr("id","muertes")
            .attr("x","10")
            .attr("y","140")
            .style("fill","black")
            .style("font-family",FONT)
            .text("");


        //Cambiamos los colores del mapa dependiendo del modo seleccionado
        d3.select("#mapMode")
        .on("change",function(){
            mode = d3.select("#mapMode").property("value");
            d3.selectAll(".country")
            .style("fill",changeColor);
        });

        //Cambiamos el color de los paises segun el año escogido
        d3.select("#year")
        .on("change",function(){
            year = d3.select("#year").property("value");
            d3.select("#yearOutput").text(year);

            let colors = updateYear(features,tasaDATA,birthsDATA,deathsDATA,year);
            colorTasaC = colors[0];
            colorTasaS = colors[1];
            colorBirths = colors[2];
            colorDeaths = colors[3];

            d3.selectAll(".country")
                .transition()
                .delay(200)
                .style("fill",changeColor);
        });

        //Cambiamos el texto del año indicado
        d3.select("#yearOutput").text(d3.select("#year").property("value"));
        

        "Funcion que cambia el color de los paises dependiendo del modo seleccionado"
        function changeColor(data){
            switch(mode){
                case "Population growth": return colorTasaC(data.properties.TasaMigration || 0);
                case "Natural increase": return colorTasaS(data.properties.TasaNoMigration || 0);
            }
        }
    
    
    })
    
    //Error al cargar los datos
    .catch((e)=>{
        alert("Hubo un error al cargar los datos");
        console.error(e);
    });

}

/**
 * Funcion mediante la cual establecemos las propeties indicadas
 * @param {*} features 
 * @param {*} tasaDATA 
 * @param {*} birthsDATA 
 * @param {*} deathsDATA 
 * @param {*} year 
 * @returns Las distintas escalas scalePow() obtenidas
 */
function updateYear(features,tasaDATA,birthsDATA,deathsDATA,year){

    //Datos referidos a la tasa de crecimiento(Population growth)
    let maxTasa = 0;
    for (let i=0; i<features.length; i++){
        for(let j=0; j<tasaDATA.length; j++){
            if(features[i].properties.name === tasaDATA[j].Entity && tasaDATA[j].Year == year){

                features[i].properties.TasaMigration = parseFloat(tasaDATA[j].TasaMigracion);

                if( parseFloat(tasaDATA[j].TasaMigracion) > maxTasa ){
                    maxTasa =  parseFloat(tasaDATA[j].TasaMigracion);
                }
            }
        }
    }

    //Datos referidos a la tasa de crecimiento(Natural increase)
    let maxTasaS = 0;
    for (let i=0; i<features.length; i++){
        for(let j=0; j<tasaDATA.length; j++){
            if(features[i].properties.name === tasaDATA[j].Entity && tasaDATA[j].Year == year){

                features[i].properties.TasaNoMigration = parseFloat(tasaDATA[j].TasaNoMigracion);

                if( parseFloat(tasaDATA[j].TasaNoMigracion) > maxTasaS ){
                    maxTasaS =parseFloat(tasaDATA[j].TasaNoMigracion);
                }
            }
        }
    }

    //Datos referidos al numero de nacimientos 
    let maxBirths = 0;
    for(let i=0; i<features.length; i++){
        for(let j=0; j<birthsDATA.length; j++){
            if(features[i].properties.name === birthsDATA[j].Entity && birthsDATA[j].Year == year){

                features[i].properties.Births = parseFloat(birthsDATA[j].Births_1);

                if( parseFloat(birthsDATA[j].Births_1) > maxBirths){
                    maxBirths =parseFloat(birthsDATA[j].Births_1);
                }
            }
        }
    }

    //Datos referidos al numero de muertes
    let maxDeaths = 0;
    for(let i=0; i<features.length; i++){
        for(let j=0; j<deathsDATA.length; j++){
            if(features[i].properties.name === deathsDATA[j].Entity && deathsDATA[j].Year == year){

                features[i].properties.Deaths = parseFloat(deathsDATA[j].Deaths1);

                if( parseFloat(deathsDATA[j].Deaths1) > maxDeaths){
                    maxDeaths =parseFloat(deathsDATA[j].Deaths1);
                }
            }
        }
    }


    //Scale Pow
    let colorTasaC = d3.scalePow()
        .exponent(0.25)
        .domain([0,maxTasa])
        .exponent(1.7)
        .range(['yellow', 'red']);

    let colorTasaS = d3.scalePow()
        .exponent(0.25)
        .domain([0,maxTasaS])
        .exponent(1.7)
        .range(['yellow', 'red']);

    let colorBirths = d3.scalePow()
        .exponent(0.25)
        .domain([0,maxBirths])
        .range(['yellow', 'red']);

    let colorDeaths = d3.scalePow()
        .exponent(0.25)
        .domain([0,maxDeaths])
        .range(['yellow', 'red']);

    //Devolvemos las escalas obtenidas
    return [colorTasaC,colorTasaS,colorBirths,colorDeaths];
}


function clone(selector) {
    var node = d3.select(selector).node();
    return d3.select(node.parentNode.appendChild(node.cloneNode(true), node.nextSibling));
}


/**
 * "Funcion que implementa la interactividad con el mouse"
 * @param {*} data 
 */
function mouseOver(data){
    d3.select(".currentCountry").remove();
   
    //Definimos el contenido de las variables que se muestran en la esquina izquierda
    let name = data.properties.name;
    let tasaMigra = data.properties.TasaMigration;
    let tasaNoMigra = data.properties.TasaNoMigration;
    let nacimientos = data.properties.Births;
    let fallecimientos = data.properties.Deaths;

    //Comprobamos que las variables no sean indefinidas

    if(name == undefined || tasaMigra == undefined || tasaNoMigra == undefined || nacimientos == undefined || fallecimientos == undefined){

        countryName.text("undefined");
        tasaMigraText.text("undefined");
        tasaNoMigraText.text("undefined");
        nacimientosText.text("undefined");
        fallecimientosText.text("undefined");
    }

    else{
    //Establecemos el texto indicado
    countryName.text(name);
    //Anotación: Hay unas regiones en las que obtengo que una de las 2 medidas de la tasa resulta INDEFINIDA a la hora de obtenerla del csv.
    //En cuanto al funcionamiento no afecta en nada, lo unico que me salta en la consola un error.
    tasaMigraText.text("Population growth: "+tasaMigra.toFixed(3)+"%");
    tasaNoMigraText.text("Natural increase: "+tasaNoMigra.toFixed(3)+"%");
    nacimientosText.text("Births: "+nacimientos.toFixed(1));
    fallecimientosText.text("Deaths: "+fallecimientos.toFixed(1));
    }


    //Añadimos el efecto de que al pasar el mouse por encima de un pais, este se resalte
    let country = clone(this);
    country
        .attr("class", "currentCountry")
        .style("stroke", "red")
        .on("mouseout", function() {
            d3.select(this).remove();
        });
}
