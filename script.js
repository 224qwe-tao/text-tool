document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('combine')) {
        // Merge page functionality
        let wordLimit = 5000;
        let listCount = 1;
        const resultTextarea = document.getElementById('result');
        const select = document.getElementById('word-limit-select');
        const customInput = document.getElementById('custom-limit');
        const listsContainer = document.querySelector('.lists');

        select.addEventListener('change', () => {
            if (select.value === 'custom') {
                customInput.style.display = 'inline-block';
            } else {
                customInput.style.display = 'none';
            }
        });

        document.getElementById('set-limit').addEventListener('click', () => {
            let newLimit;
            if (select.value === 'custom') {
                newLimit = parseInt(customInput.value, 10) || 5000;
            } else {
                newLimit = parseInt(select.value, 10) || 5000;
            }
            wordLimit = newLimit;
            alert(`Word limit set to ${wordLimit}`);
            // Truncate existing text areas if necessary
            document.querySelectorAll('.lists textarea').forEach(ta => {
                const words = ta.value.trim().split(/\s+/).filter(w => w.length > 0);
                if (words.length > wordLimit) {
                    ta.value = words.slice(0, wordLimit).join(' ');
                }
            });
        });

        function addInputListener(ta) {
            ta.addEventListener('input', function() {
                const text = this.value;
                const words = text.trim().split(/\s+/).filter(w => w.length > 0);
                if (words.length > wordLimit) {
                    this.value = words.slice(0, wordLimit).join(' ') + (text.endsWith(' ') ? ' ' : '');
                }
            });
        }

        function attachDeleteListener(btn, listDiv) {
            btn.addEventListener('click', () => {
                if (listsContainer.querySelectorAll('.list').length > 1) {
                    listDiv.remove();
                    renumberLists();
                } else {
                    // For the last list, just clear the text
                    listDiv.querySelector('textarea').value = '';
                }
            });
        }

        function renumberLists() {
            const lists = listsContainer.querySelectorAll('.list');
            listCount = lists.length;
            lists.forEach((list, index) => {
                list.querySelector('label').textContent = `List ${index + 1}`;
            });
        }

        function attachZoomListener(btn, ta) {
            btn.addEventListener('click', () => {
                openZoomModal(ta);
            });
        }

        function attachCopyListener(btn, ta) {
            btn.addEventListener('click', () => {
                ta.select();
                document.execCommand('copy');
            });
        }

        function openZoomModal(originalTa) {
            const modal = document.createElement('div');
            modal.classList.add('modal');
            const content = document.createElement('div');
            content.classList.add('modal-content');
            const modalTa = document.createElement('textarea');
            modalTa.classList.add('modal-textarea');
            modalTa.value = originalTa.value;
            const zoomOutBtn = document.createElement('button');
            zoomOutBtn.classList.add('zoom-out');
            zoomOutBtn.innerHTML = '<i class="fas fa-compress"></i>';
            zoomOutBtn.addEventListener('click', () => {
                originalTa.value = modalTa.value;
                modal.remove();
            });
            content.appendChild(modalTa);
            content.appendChild(zoomOutBtn);
            modal.appendChild(content);
            document.body.appendChild(modal);
        }

        // Initial setup
        const initialTa = document.querySelector('.lists textarea');
        addInputListener(initialTa);
        const initialClearBtn = document.querySelector('.lists .clear-text');
        attachDeleteListener(initialClearBtn, document.querySelector('.list'));
        const initialCopyBtn = document.querySelector('.lists .copy-text');
        attachCopyListener(initialCopyBtn, initialTa);
        const initialZoomBtn = document.querySelector('.lists .zoom-in');
        attachZoomListener(initialZoomBtn, initialTa);

        const resultCopyBtn = document.querySelector('.result .copy-text');
        attachCopyListener(resultCopyBtn, resultTextarea);
        const resultZoomBtn = document.querySelector('.result .zoom-in');
        attachZoomListener(resultZoomBtn, resultTextarea);

        document.getElementById('add-list').addEventListener('click', () => {
            listCount++;
            const newList = document.createElement('div');
            newList.classList.add('list');
            newList.innerHTML = `
                <label>List ${listCount}</label>
                <div class="textarea-wrapper">
                    <textarea placeholder="Type or paste your content here."></textarea>
                    <button class="clear-text">×</button>
                </div>
                <div class="button-bar">
                    <button class="copy-text"><i class="fas fa-copy"></i></button>
                    <button class="zoom-in"><i class="fas fa-expand"></i></button>
                </div>
            `;
            listsContainer.appendChild(newList);
            const newTa = newList.querySelector('textarea');
            addInputListener(newTa);
            const newClearBtn = newList.querySelector('.clear-text');
            attachDeleteListener(newClearBtn, newList);
            const newCopyBtn = newList.querySelector('.copy-text');
            attachCopyListener(newCopyBtn, newTa);
            const newZoomBtn = newList.querySelector('.zoom-in');
            attachZoomListener(newZoomBtn, newTa);
        });

        document.getElementById('combine').addEventListener('click', () => {
            const textareas = document.querySelectorAll('.lists textarea');
            const separator = document.getElementById('space-separation').checked ? ' ' : '\n\n';
            const allText = Array.from(textareas)
                .map(ta => ta.value.trim())
                .filter(text => text)
                .join(separator);
            resultTextarea.value = allText;
        });

        document.getElementById('copy').addEventListener('click', () => {
            resultTextarea.select();
            document.execCommand('copy');
        });

        document.getElementById('clear').addEventListener('click', () => {
            document.querySelectorAll('textarea').forEach(ta => ta.value = '');
            localStorage.removeItem('mergeData');
        });

        document.getElementById('save').addEventListener('click', () => {
            saveMergeState();
        });

        document.getElementById('reset').addEventListener('click', () => {
            wordLimit = 5000;
            select.value = '5000';
            customInput.style.display = 'none';
            document.querySelectorAll('textarea').forEach(ta => ta.value = '');
            listsContainer.innerHTML = `
                <div class="list">
                    <label>List 1</label>
                    <div class="textarea-wrapper">
                        <textarea placeholder="Type or paste your content here."></textarea>
                        <button class="clear-text">×</button>
                    </div>
                    <div class="button-bar">
                        <button class="copy-text"><i class="fas fa-copy"></i></button>
                        <button class="zoom-in"><i class="fas fa-expand"></i></button>
                    </div>
                </div>
            `;
            const resetTa = listsContainer.querySelector('textarea');
            addInputListener(resetTa);
            const resetClearBtn = listsContainer.querySelector('.clear-text');
            attachDeleteListener(resetClearBtn, listsContainer.querySelector('.list'));
            const resetCopyBtn = listsContainer.querySelector('.copy-text');
            attachCopyListener(resetCopyBtn, resetTa);
            const resetZoomBtn = listsContainer.querySelector('.zoom-in');
            attachZoomListener(resetZoomBtn, resetTa);
            listCount = 1;
            localStorage.removeItem('mergeData');
            document.getElementById('space-separation').checked = false;
        });

        document.getElementById('download').addEventListener('click', () => {
            const blob = new Blob([resultTextarea.value], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'merged_text.txt';
            a.click();
            URL.revokeObjectURL(url);
            // Save content to localStorage after download to persist on the website
            saveMergeState();
        });

        document.getElementById('next').addEventListener('click', () => {
            window.location.href = 'segment.html';
        });

        function saveMergeState() {
            const data = {
                wordLimit: wordLimit,
                lists: Array.from(document.querySelectorAll('.lists textarea')).map(ta => ta.value),
                result: resultTextarea.value,
                spaceSeparation: document.getElementById('space-separation').checked
            };
            localStorage.setItem('mergeData', JSON.stringify(data));
        }

        function loadMergeState() {
            const saved = localStorage.getItem('mergeData');
            if (saved) {
                const data = JSON.parse(saved);
                wordLimit = data.wordLimit;
                const additionalLists = data.lists.length - 1; // Initial list is 1
                for (let k = 2; k <= data.lists.length; k++) {
                    const newList = document.createElement('div');
                    newList.classList.add('list');
                    newList.innerHTML = `
                        <label>List ${k}</label>
                        <div class="textarea-wrapper">
                            <textarea placeholder="Type or paste your content here."></textarea>
                            <button class="clear-text">×</button>
                        </div>
                        <div class="button-bar">
                            <button class="copy-text"><i class="fas fa-copy"></i></button>
                            <button class="zoom-in"><i class="fas fa-expand"></i></button>
                        </div>
                    `;
                    listsContainer.appendChild(newList);
                    const newTa = newList.querySelector('textarea');
                    addInputListener(newTa);
                    const newClearBtn = newList.querySelector('.clear-text');
                    attachDeleteListener(newClearBtn, newList);
                    const newCopyBtn = newList.querySelector('.copy-text');
                    attachCopyListener(newCopyBtn, newTa);
                    const newZoomBtn = newList.querySelector('.zoom-in');
                    attachZoomListener(newZoomBtn, newTa);
                }
                listCount = data.lists.length;
                // Set input values
                const textareas = document.querySelectorAll('.lists textarea');
                data.lists.forEach((value, index) => {
                    textareas[index].value = value;
                });
                resultTextarea.value = data.result;
                // Set select and custom input
                const options = Array.from(select.options).map(opt => opt.value);
                if (options.includes(data.wordLimit.toString())) {
                    select.value = data.wordLimit.toString();
                    customInput.style.display = 'none';
                } else {
                    select.value = 'custom';
                    customInput.style.display = 'inline-block';
                    customInput.value = data.wordLimit;
                }
                document.getElementById('space-separation').checked = data.spaceSeparation || false;
            }
        }

        loadMergeState();
    } else if (document.getElementById('segment')) {
        // Segment page functionality
        let wordLimit = 500;
        let segmentCount = 1;
        const inputTextarea = document.getElementById('input-text');
        const segmentsContainer = document.querySelector('.segments');
        const select = document.getElementById('word-limit-select');
        const customInput = document.getElementById('custom-limit');

        select.addEventListener('change', () => {
            if (select.value === 'custom') {
                customInput.style.display = 'inline-block';
            } else {
                customInput.style.display = 'none';
            }
        });

        document.getElementById('set-limit').addEventListener('click', () => {
            let newLimit;
            if (select.value === 'custom') {
                newLimit = parseInt(customInput.value, 10) || 500;
            } else {
                newLimit = parseInt(select.value, 10) || 500;
            }
            wordLimit = newLimit;
            alert(`Range set to ${wordLimit}`);
        });

        function attachCopyListener(btn, ta) {
            btn.addEventListener('click', () => {
                ta.select();
                document.execCommand('copy');
            });
        }

        function attachZoomListener(btn, ta) {
            btn.addEventListener('click', () => {
                openZoomModal(ta);
            });
        }

        function attachDeleteListener(btn, segmentDiv) {
            btn.addEventListener('click', () => {
                segmentDiv.remove();
                renumberSegments();
            });
        }

        function renumberSegments() {
            const segments = segmentsContainer.querySelectorAll('.segment');
            segmentCount = segments.length;
            segments.forEach((segment, index) => {
                segment.querySelector('label').textContent = `Segment ${index + 1}`;
            });
        }

        function openZoomModal(originalTa) {
            const modal = document.createElement('div');
            modal.classList.add('modal');
            const content = document.createElement('div');
            content.classList.add('modal-content');
            const modalTa = document.createElement('textarea');
            modalTa.classList.add('modal-textarea');
            modalTa.value = originalTa.value;
            const zoomOutBtn = document.createElement('button');
            zoomOutBtn.classList.add('zoom-out');
            zoomOutBtn.innerHTML = '<i class="fas fa-compress"></i>';
            zoomOutBtn.addEventListener('click', () => {
                originalTa.value = modalTa.value;
                modal.remove();
            });
            content.appendChild(modalTa);
            content.appendChild(zoomOutBtn);
            modal.appendChild(content);
            document.body.appendChild(modal);
        }

        // Initial input copy and zoom buttons
        const inputCopyBtn = document.querySelector('.lists .copy-text');
        attachCopyListener(inputCopyBtn, inputTextarea);
        const inputZoomBtn = document.querySelector('.lists .zoom-in');
        attachZoomListener(inputZoomBtn, inputTextarea);

        document.getElementById('segment').addEventListener('click', () => {
            const text = inputTextarea.value.trim();
            const words = text.split(/\s+/).filter(w => w.length > 0);
            segmentsContainer.innerHTML = '';
            segmentCount = 1;
            for (let i = 0; i < words.length; i += wordLimit) {
                const segmentText = words.slice(i, i + wordLimit).join(' ');
                addSegment(segmentText);
            }
        });

        function addSegment(value) {
            const newSegment = document.createElement('div');
            newSegment.classList.add('segment');
            newSegment.innerHTML = `
                <label>Segment ${segmentCount}</label>
                <div class="textarea-wrapper">
                    <textarea>${value}</textarea>
                    <button class="clear-text">×</button>
                </div>
                <div class="button-bar">
                    <button class="copy-text"><i class="fas fa-copy"></i></button>
                    <button class="zoom-in"><i class="fas fa-expand"></i></button>
                </div>
            `;
            segmentsContainer.appendChild(newSegment);
            const newTa = newSegment.querySelector('textarea');
            const newCopyBtn = newSegment.querySelector('.copy-text');
            attachCopyListener(newCopyBtn, newTa);
            const newZoomBtn = newSegment.querySelector('.zoom-in');
            attachZoomListener(newZoomBtn, newTa);
            const newDeleteBtn = newSegment.querySelector('.clear-text');
            attachDeleteListener(newDeleteBtn, newSegment);
            segmentCount++;
        }

        document.getElementById('copy').addEventListener('click', () => {
            const allText = Array.from(segmentsContainer.querySelectorAll('textarea'))
                .map(ta => ta.value.trim())
                .filter(text => text)
                .join('\n\n\n');
            const tempTextarea = document.createElement('textarea');
            tempTextarea.value = allText;
            document.body.appendChild(tempTextarea);
            tempTextarea.select();
            document.execCommand('copy');
            document.body.removeChild(tempTextarea);
        });

        document.getElementById('clear').addEventListener('click', () => {
            document.querySelectorAll('textarea').forEach(ta => ta.value = '');
            segmentsContainer.innerHTML = '';
            localStorage.removeItem('segmentData');
        });

        document.getElementById('save').addEventListener('click', () => {
            saveSegmentState();
        });

        document.getElementById('reset').addEventListener('click', () => {
            wordLimit = 500;
            select.value = '500';
            customInput.style.display = 'none';
            inputTextarea.value = '';
            segmentsContainer.innerHTML = '';
            segmentCount = 1;
            localStorage.removeItem('segmentData');
        });

        document.getElementById('download').addEventListener('click', () => {
            const allText = Array.from(segmentsContainer.querySelectorAll('textarea'))
                .map(ta => ta.value.trim())
                .filter(text => text)
                .join('\n\n\n');
            const blob = new Blob([allText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'segmented_text.txt';
            a.click();
            URL.revokeObjectURL(url);
            // Save content to localStorage after download to persist on the website
            saveSegmentState();
        });

        document.getElementById('back').addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        function saveSegmentState() {
            const data = {
                wordLimit: wordLimit,
                input: inputTextarea.value,
                segments: Array.from(segmentsContainer.querySelectorAll('textarea')).map(ta => ta.value)
            };
            localStorage.setItem('segmentData', JSON.stringify(data));
        }

        function loadSegmentState() {
            const saved = localStorage.getItem('segmentData');
            if (saved) {
                const data = JSON.parse(saved);
                wordLimit = data.wordLimit;
                inputTextarea.value = data.input;
                segmentsContainer.innerHTML = '';
                segmentCount = 1;
                data.segments.forEach(value => {
                    addSegment(value);
                });
                // Set select and custom input
                const options = Array.from(select.options).map(opt => opt.value);
                if (options.includes(data.wordLimit.toString())) {
                    select.value = data.wordLimit.toString();
                    customInput.style.display = 'none';
                } else {
                    select.value = 'custom';
                    customInput.style.display = 'inline-block';
                    customInput.value = data.wordLimit;
                }
            }
        }

        loadSegmentState();
    }
});