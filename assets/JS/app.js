// check off Specific Todos By Clicking
$("ul").on("click", "li", function(){
$(this).toggleClass("completed")
});

// click on X to delete Todo
$("ul").on("click", "span", function(event){
$(this).parent().fadeOut(function(){
    $(this).remove();
});
    event.stopPropagation();
})

//add Todo from input
$("input[type='text']").keypress(function(event){
    var todo = $(this).val()
    if(event.which === 13 && todo != ""){
    //13 keyvalue is for enter key
    add(todo); //add that todo in ul
    $(this).val("") //empty the imput after pressing enter
    }
})

//function to add todo
function add(todo){
    $("ul").append("<li><span><img src='assets/SVG/check_box.svg'></span>" + todo + "</li>")
}

//show and hide input
$("#create").click(function(){
    $("input[type='text']").toggleClass("hide")
})