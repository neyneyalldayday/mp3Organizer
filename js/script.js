document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('dropArea');
    const fileList = document.getElementById('fileList');
    const fileInput = document.getElementById('fileInput');

    dropArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropArea.style.borderColor = 'blue';
    });

    dropArea.addEventListener('dragleave', () => {
      dropArea.style.borderColor = '#ccc';
    });

    dropArea.addEventListener('drop', (e) => {
      e.preventDefault();
      dropArea.style.borderColor = '#ccc';

      const files = e.dataTransfer.files;
      handleFiles(files);
    });

    dropArea.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const files = e.target.files;
      handleFiles(files);
    });


    async function organizeFiles(organizedFiles) {
        try {
          const response = await fetch('/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ files: organizedFiles }),
          });
    
          if (!response.ok) {
            throw new Error('Error organizing files');
          }
    
          const data = await response.json();
          console.log(data); 
        } catch (error) {
          console.error('Error:', error);
          // Handle error display or other actions
        }
      }
      

    function handleFiles(files) {
      fileList.innerHTML = ''; // Clear previous list
      
      for (const file of files) {
        const listItem = document.createElement('li');
        listItem.textContent = file.name;
        listItem.draggable = true;

        listItem.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', file.name);
        });

        fileList.appendChild(listItem);
      }
    }


    document.getElementById('organizeButton').addEventListener('click', () => {
        const filesList = document.getElementById('fileList').getElementsByTagName('li');
        const organizedFiles = [];
    
        for (const fileListItem of filesList) {
          const fileName = fileListItem.textContent;
          // Add your logic here to organize files and structure them
          // For this example, just a simple structure is created
          organizedFiles.push({ name: fileName, destination: 'desired_destination' });
        }
    
        // Send the organized files to the server for processing
        organizeFiles(organizedFiles);
      });


    // You can add more logic here to handle organizing the files
    // and interacting with the backend for processing and creating folders.
  });