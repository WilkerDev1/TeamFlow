function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    // Guardamos el ID de la tarea que se está arrastrando
    ev.dataTransfer.setData("text", ev.target.id);
    ev.target.classList.add('dragging');
}

function drop(ev) {
    ev.preventDefault();
    var taskId = ev.dataTransfer.getData("text");
    var taskElement = document.getElementById(taskId);
    taskElement.classList.remove('dragging');
    
    // Encontrar la columna destino (buscamos el padre con la clase kanban-col)
    let targetCol = ev.target.closest('.kanban-col');
    
    if (targetCol) {
        targetCol.appendChild(taskElement);
        
        // Obtener el nuevo estado del atributo data-status
        const newStatus = targetCol.getAttribute('data-status');
        
        // Llamada AJAX al servidor para persistir el cambio (TF-006)
        fetch('/api/tasks/move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId, newStatus })
        })
        .then(res => res.json())
        .then(data => {
            if(data.success) console.log('Estado actualizado a:', newStatus);
        })
        .catch(err => console.error('Error al mover tarea:', err));
    }
}