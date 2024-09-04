function showProject(id) {
    document.getElementById(id).style.display = 'flex';
}
function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

var intervalo = 5000;

setInterval(function () {
    location.reload();
}, intervalo);

