document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    const uploadForm = document.getElementById('uploadForm');
    const preview = document.getElementById('preview');
  
    fileInput.addEventListener('change', () => {
      updateFileList();
      previewFiles();
    });
  
    uploadForm.addEventListener('submit', (event) => {
      event.preventDefault();
      uploadFormAction();
    });
  
    function updateFileList() {
      const files = fileInput.files;
      fileList.innerHTML = `<p>Selected Files:</p>`;
  
      for (const file of files) {
        const listItem = document.createElement('div');
        listItem.innerHTML = `
          <span>${file.name}</span>
          <button class="delete-btn" data-file="${file.name}">Delete</button>
        `;
        fileList.appendChild(listItem);
      }
  
      // Add click event listeners to delete buttons
      const deleteButtons = document.querySelectorAll('.delete-btn');
      deleteButtons.forEach(button => {
        button.addEventListener('click', (event) => {
          const fileName = event.target.dataset.file;
          deleteFile(fileName);
        });
      });
    }
  
    function previewFiles() {
      preview.innerHTML = '';
  
      for (const file of fileInput.files) {
        const previewItem = document.createElement('div');
        previewItem.classList.add('preview-item');
  
        if (file.type.startsWith('image/')) {
          const img = document.createElement('img');
          img.src = URL.createObjectURL(file);
          img.alt = file.name;
          img.style.maxWidth = '100px';
          img.style.maxHeight = '100px';
          previewItem.appendChild(img);
        } else {
          const fileName = document.createElement('p');
          fileName.textContent = file.name;
          previewItem.appendChild(fileName);
        }
  
        preview.appendChild(previewItem);
      }
    }
  
    function deleteFile(fileName) {
        const formData = new FormData();
        formData.append('fileName', fileName);
      
        fetch('/delete', {
          method: 'POST',
          body: formData,
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            console.log(data.message);
            if (data.success) {
              console.log('File deleted successfully on the client side.');
              // Filter out the deleted file from the file input's files array
              fileInput.files = Array.from(fileInput.files).filter(file => file.name !== fileName);
              updateFileList();
              previewFiles();
            }
            showMessage(data.message);
          })
          .catch(error => console.error('Error:', error));
      }
      
  
    function uploadFormAction() {
      const formData = new FormData(uploadForm);
  
      fetch('/upload', {
        method: 'POST',
        body: formData,
      })
        .then(response => response.json())
        .then(data => {
          console.log(data.message);
          updateFileList();
          previewFiles();
          showMessage(data.message);
        })
        .catch(error => {
          console.error('Error:', error);
          showMessage('An error occurred.');
        });
    }
  
    function showMessage(message) {
      const messageDiv = document.createElement('div');
      messageDiv.textContent = message;
      messageDiv.style.color = 'green';
      messageDiv.style.marginTop = '10px';
      document.body.appendChild(messageDiv);
  
      setTimeout(() => {
        messageDiv.remove();
      }, 3000);
    }
  });
  