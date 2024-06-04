const recordButton = document.getElementById('record');
const stopButton = document.getElementById('stop');
const deleteAllButton = document.getElementById('delete-all');
const listaArchivos = document.getElementById('lista-archivos');
const recordingIndicator = document.getElementById('recording-indicator');
const confirmDeleteButton = document.getElementById('confirmDeleteButton');
const confirmDeleteAllButton = document.getElementById('confirmDeleteAllButton');
const paginationContainer = document.getElementById('pagination-container');
let mediaRecorder; // Variable para guardar el objeto MediaRecorder
let audioChunks = []; // Variable para guardar los fragmentos de audio
let audioElement = null; // Variable para guardar el elemento de audio que se está reproduciendo
let archivoAEliminar; // Variable para guardar el id del archivo que se va a eliminar
let updateIntervalId; // Variable para guardar el id del intervalo de actualización
let archivoIdParaEditar; // Variable para guardar el id del archivo que se va a editar
let paginaActual = 1; // Página actual de la lista de archivos
const pageSize = 10; // Tamaño de página de la lista de archivos

document.getElementById('confirmEditButton').addEventListener('click', () => {
  const nuevoNombre = document.getElementById('newNameInput').value; // Obtenemos el nuevo nombre del input en el modal
  if (nuevoNombre) {
    fetch(`/api/archivos/${archivoIdParaEditar}`, { // Usamos el id del archivo que guardaste antes
      method: 'PATCH', // Método PATCH para actualizar el nombre del archivo
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombre: nuevoNombre + '.wav' }), 
    })
    .then(() => {
      actualizarListaArchivos(); // Actualiza la lista de archivos
    })
    .catch(error => console.error('Error:', error));
  }
  $('#editNameModal').modal('hide'); // Oculta el modal
});

// Intervalo de tiempo para actualizar la lista de archivos (en milisegundos)
const updateInterval = 5000; // 5 segundos

recordButton.addEventListener('click', () => {
  navigator.mediaDevices.getUserMedia({ audio: true }) // Pide permiso para acceder al micrófono
    .then(stream => { // Si se acepta el permiso
      mediaRecorder = new MediaRecorder(stream); // Crea un objeto MediaRecorder con el stream del micrófono
      mediaRecorder.start(); // Comienza a grabar
      recordButton.disabled = true; // Deshabilita el botón de grabar
      stopButton.disabled = false; // Habilita el botón de detener
      recordingIndicator.classList.remove('d-none'); // Muestra el indicador de grabación

      mediaRecorder.addEventListener('dataavailable', event => { // Cuando hay datos disponibles
        audioChunks.push(event.data); // Agrega los datos al array de fragmentos de audio
      });

      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks); // Crea un blob con los fragmentos de audio
        const formData = new FormData(); // Crea un objeto FormData
        formData.append('archivo', audioBlob, 'grabacion.wav'); // Agrega el blob al objeto FormData
        fetch('/api/archivos', { // Envía el archivo al servidor
          method: 'POST', // Método POST para subir el archivo
          body: formData // Cuerpo de la petición
        }).then(() => {
          actualizarListaArchivos(); 
        });
        audioChunks = [];
        recordingIndicator.classList.add('d-none'); // Oculta el indicador de grabación
      });
    });
});

stopButton.addEventListener('click', () => {
  mediaRecorder.stop(); // Detiene la grabación
  recordButton.disabled = false; // Habilita el botón de grabar
  stopButton.disabled = true; // Deshabilita el botón de detener
  recordingIndicator.classList.add('d-none'); // Oculta el indicador de grabación
});

deleteAllButton.addEventListener('click', () => {
  $('#confirmDeleteAllModal').modal('show'); // Muestra el modal de confirmación para borrar todos los archivos
});

confirmDeleteAllButton.addEventListener('click', () => {
  fetch(`/api/archivos`, { // Ruta para borrar todos los archivos
    method: 'DELETE' // Método DELETE para borrar todos los archivos
  }).then(() => {
    $('#confirmDeleteAllModal').modal('hide');
    actualizarListaArchivos(paginaActual); // Actualiza la lista de archivos
  });
});

function actualizarListaArchivos(page = 1) {
  fetch(`/api/archivos?page=${page}&pageSize=${pageSize}`) // Obtiene la lista de archivos
    .then(response => response.json()) // Convierte la respuesta a JSON
    .then(data => { // Procesa los datos
      const { archivos, total } = data;
      listaArchivos.innerHTML = ''; // Limpia la lista de archivos
      archivos.forEach(archivo => { // Por cada archivo
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

        const span = document.createElement('span');
        span.textContent = archivo.name;
        span.classList.add('nombre-archivo');
        li.appendChild(span);

        const btnGroup = document.createElement('div');
        btnGroup.classList.add('btn-group'); // Crea un grupo de botones

        const btnReproducir = document.createElement('button');
        btnReproducir.innerHTML = '<i class="fas fa-play"></i>';
        btnReproducir.classList.add('btn', 'btn-success', 'ml-2');
        btnReproducir.addEventListener('click', () => {
          if (audioElement && !audioElement.paused) {
            audioElement.pause();
            audioElement.currentTime = 0;
            audioElement = null;
          }
          fetch(`/api/archivos/${archivo.id}`)
            .then(response => response.blob())
            .then(blob => {
              const url = URL.createObjectURL(blob);
              audioElement = new Audio(url);
              audioElement.play();
              span.textContent = `${archivo.name} (Reproduciendo...)`; // Cambia el nombre del archivo a "Reproduciendo..."

              audioElement.addEventListener('ended', () => {
                span.textContent = archivo.name; // Cuando termina de reproducir, vuelve a mostrar el nombre del archivo
              });

              audioElement.addEventListener('pause', () => {
                if (audioElement.currentTime === audioElement.duration) {
                  span.textContent = archivo.name;
                } else {
                  span.textContent = `${archivo.name} (Pausado)`; // Muestra el nombre del archivo con "(Pausado)"
                }
              });
            });
        });
        btnGroup.appendChild(btnReproducir); // Agrega el botón de reproducir al grupo de botones

        const btnPausar = document.createElement('button');
        btnPausar.innerHTML = '<i class="fas fa-pause"></i>';
        btnPausar.classList.add('btn', 'btn-warning', 'ml-2');
        btnPausar.addEventListener('click', () => {
          if (audioElement && !audioElement.paused) {
            audioElement.pause();
          }
        });
        btnGroup.appendChild(btnPausar);

        const btnEditar = document.createElement('button');
        btnEditar.innerHTML = '<i class="fas fa-edit"></i>';
        btnEditar.classList.add('btn', 'btn-primary', 'ml-2');
        btnEditar.addEventListener('click', () => {
          archivoIdParaEditar = archivo.id; // Guarda el id del archivo que estás editando
          $('#editNameModal').modal('show'); // Muestra el modal
        });
        btnGroup.appendChild(btnEditar);

        const btnDetener = document.createElement('button');
        btnDetener.innerHTML = '<i class="fas fa-stop"></i>';
        btnDetener.classList.add('btn', 'btn-danger', 'ml-2');
        btnDetener.addEventListener('click', () => {
          if (audioElement) {
            audioElement.pause();
            audioElement.currentTime = 0;
            span.textContent = archivo.name;
            audioElement = null;
          }
        });
        btnGroup.appendChild(btnDetener);

        const btnBorrar = document.createElement('button');
        btnBorrar.innerHTML = '<i class="fas fa-trash"></i>';
        btnBorrar.classList.add('btn', 'btn-danger', 'ml-2');
        btnBorrar.addEventListener('click', () => {
          archivoAEliminar = archivo.id;
          $('#confirmDeleteModal').modal('show');
        });
        btnGroup.appendChild(btnBorrar);

        li.appendChild(btnGroup);
        listaArchivos.appendChild(li);
      });

      // Actualizar la paginación
      actualizarPaginacion(total, page, pageSize);
    });
}

function actualizarPaginacion(total, currentPage, pageSize) {
  const totalPages = Math.ceil(total / pageSize);
  paginationContainer.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.classList.add('btn', 'btn-primary', 'ml-1', 'mr-1');
    if (i === currentPage) {
      pageButton.classList.add('active');
    }
    pageButton.addEventListener('click', () => {
      actualizarListaArchivos(i);
    });
    paginationContainer.appendChild(pageButton);
  }
}

confirmDeleteButton.addEventListener('click', () => {
  fetch(`/api/archivos/${archivoAEliminar}`, {
    method: 'DELETE'
  }).then(() => {
    $('#confirmDeleteModal').modal('hide');
    actualizarListaArchivos(paginaActual);
  });
});

// Actualizar la lista de archivos automáticamente cada cierto intervalo
updateIntervalId = setInterval(() => actualizarListaArchivos(paginaActual), updateInterval); // Actualiza la lista de archivos cada 5 segundos

// Actualizar la lista de archivos al cargar la página
actualizarListaArchivos(paginaActual);
