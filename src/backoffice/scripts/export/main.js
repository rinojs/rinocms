



function menu()
{
    const container = document.getElementById('sidebar-container');
    container.classList.toggle('sidebar-container--visible');
    container.classList.toggle('sidebar-container--invisible');
}

export { menu };