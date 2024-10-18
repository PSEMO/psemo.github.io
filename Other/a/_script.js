const content = document.getElementById("content");

function showProjects()
{
    for (let index = 0; index < 24; index++)
    {
        const div = document.createElement('div');
        div.className = "wrapper";
        div.innerHTML = `
        <div class="box vintage">
            <img src="./untitled.png">
            <h2>Project Name</h2>
            <p>Short Description</p>
        </div>
        `;

        content.appendChild(div);
        console.log(index);
    }
}

showProjects();