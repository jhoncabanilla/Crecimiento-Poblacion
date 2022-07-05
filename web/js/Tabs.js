/**
 * @file Archivo principal, continene el punto de entrada de la web
 * @author Jhon Steeven Cabanilla Alvarado
 */

 /**
  * Mediante $(document).ready() de jQuery, el codigo incluido dentro sólo se ejecutará una vez que el Modelo de Objetos del Documento(DOM)
  * de la pagina este listo para que se ejecute el codigo JS.
  */
  $(document).ready(function () {
    let regiones = ["Less Developed Regions", "More Developed Regions", "Least Developed Countries", "Low-income countries", "Lower-middle-income countries", "Middle-income countries", "Upper-middle-income countries", "High income countries"];
    var tipotasa = 0;

    // Manejador de tabs
    $('#tabs li a:not(:first)').addClass('inactive');
    $('.container').hide();
    $('.container:first').show();
    $('#tabs li a').click(function () {
        var t = $(this).attr('id');
        if ($(this).hasClass('inactive')) {
            $('#tabs li a').addClass('inactive');
            $(this).removeClass('inactive');

            $('.container').hide();
            $('#' + t + 'C').fadeIn('slow');

            // Cargamos cada tab solo cuando está seleccionado
            switch (t) {
                case "tab1":
                    //En el caso de que se trate del primer tab deberemos hacer un remove() de todos los svg contenidos en el div grafico además de la respectiva
                    //leyenda del mapa, ya que si no lo borro aparecen nuevas leyendas superpuestas.
                    d3.select("#grafico").selectAll("svg").remove();
                    d3.select("#Leyenda").selectAll("svg").remove();
                    dibujarMapa();
                    break;

                case "tab2":
                    d3.select("#serie").selectAll("svg").remove();
                    dibujarGrafico(regiones,tipotasa);
                    break;
            }
        }
    });


    //Al principio se carga el tab1 que se corresponde con el mapa de coropletas
    d3.select("#grafico").selectAll("svg").remove();
    d3.select("#Leyenda").selectAll("svg").remove();
    dibujarMapa();

 
    // Gráfico 2
    // Para la selección de las Regiones del line chart utilizamos la librería jQuery ya que el manejo de eventos resulta sencillo y rápido.
    //$ se trata de una abreviacion de jQuery
    $("input[type=checkbox]").change(function () {
        if (this.checked) {
            regiones.push(this.name);
        } else {
            regiones.splice(regiones.indexOf(this.name), 1);
        }

        d3.select("#serie").selectAll("svg").remove();
        dibujarGrafico(regiones,tipotasa);
    });


    // Seleccionamos la medida de la Tasa
    $("input[type=radio][name=tipotasa]").change(function () {
        tipotasa = parseInt($(this).val());
        d3.select("#serie").selectAll("svg").remove();
        dibujarGrafico(regiones,tipotasa);
    });

});