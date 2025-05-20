// Initialize inventory data from localStorage or use empty array
        let inventoryItems = JSON.parse(localStorage.getItem('inventoryItems')) || [];
        
        // DOM elements
        const addItemBtn = document.getElementById('addItemBtn');
        const addFirstItemBtn = document.getElementById('addFirstItemBtn');
        const addItemModal = document.getElementById('addItemModal');
        const cancelAddItem = document.getElementById('cancelAddItem');
        const addItemForm = document.getElementById('addItemForm');
        const rentItemModal = document.getElementById('rentItemModal');
        const cancelRentItem = document.getElementById('cancelRentItem');
        const rentItemForm = document.getElementById('rentItemForm');
        const returnItemModal = document.getElementById('returnItemModal');
        const cancelReturnItem = document.getElementById('cancelReturnItem');
        const returnItemForm = document.getElementById('returnItemForm');
        const viewItemModal = document.getElementById('viewItemModal');
        const closeViewItem = document.getElementById('closeViewItem');
        const searchInput = document.getElementById('searchInput');
        const filterStatus = document.getElementById('filterStatus');
        
        // Event listeners
        addItemBtn.addEventListener('click', openAddItemModal);
        addFirstItemBtn.addEventListener('click', openAddItemModal);
        cancelAddItem.addEventListener('click', closeAddItemModal);
        addItemForm.addEventListener('submit', handleAddItem);
        cancelRentItem.addEventListener('click', closeRentItemModal);
        rentItemForm.addEventListener('submit', handleRentItem);
        cancelReturnItem.addEventListener('click', closeReturnItemModal);
        returnItemForm.addEventListener('submit', handleReturnItem);
        closeViewItem.addEventListener('click', closeViewItemModal);
        searchInput.addEventListener('input', renderInventoryTable);
        filterStatus.addEventListener('change', renderInventoryTable);
        
        // Initialize the page
        renderInventoryTable();
        updateCounters();
        checkEmptyState();
        
        // Modal functions
        function openAddItemModal() {
            addItemModal.classList.remove('hidden');
            document.getElementById('itemName').focus();
        }
        
        function closeAddItemModal() {
            addItemModal.classList.add('hidden');
            addItemForm.reset();
        }
        
        function openRentItemModal(itemId) {
            const item = inventoryItems.find(item => item.id === itemId);
            if (item) {
                document.getElementById('rentItemId').value = item.id;
                document.getElementById('rentItemName').textContent = item.name;
                
                // Set due date default to 7 days from now
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + 7);
                document.getElementById('dueDate').valueAsDate = dueDate;
                
                rentItemModal.classList.remove('hidden');
                document.getElementById('renterName').focus();
            }
        }
        
        function closeRentItemModal() {
            rentItemModal.classList.add('hidden');
            rentItemForm.reset();
        }
        
        function openReturnItemModal(itemId) {
            const item = inventoryItems.find(item => item.id === itemId);
            if (item && item.status === 'rented') {
                document.getElementById('returnItemId').value = item.id;
                document.getElementById('returnItemName').textContent = item.name;
                document.getElementById('returnRenterName').textContent = item.rentedTo;
                document.getElementById('returnRentalDate').textContent = formatDate(item.rentalDate);
                document.getElementById('returnDueDate').textContent = formatDate(item.dueDate);
                
                returnItemModal.classList.remove('hidden');
            }
        }
        
        function closeReturnItemModal() {
            returnItemModal.classList.add('hidden');
            returnItemForm.reset();
        }
        
        function openViewItemModal(itemId) {
            const item = inventoryItems.find(item => item.id === itemId);
            if (item) {
                document.getElementById('viewItemName').textContent = item.name;
                document.getElementById('viewItemCategory').textContent = item.category;
                document.getElementById('viewItemDescription').textContent = item.description || 'No description provided';
                
                const statusElement = document.getElementById('viewItemStatus');
                if (item.status === 'available') {
                    statusElement.textContent = 'Available';
                    statusElement.className = 'font-medium text-green-600';
                } else {
                    statusElement.textContent = 'Rented Out';
                    statusElement.className = 'font-medium text-red-600';
                }
                
                const rentalDetails = document.getElementById('viewItemRentalDetails');
                const actionButton = document.getElementById('viewItemAction');
                
                if (item.status === 'available') {
                    rentalDetails.classList.add('hidden');
                    actionButton.textContent = 'Rent Out';
                    actionButton.className = 'px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white';
                    actionButton.onclick = () => {
                        closeViewItemModal();
                        openRentItemModal(item.id);
                    };
                } else {
                    rentalDetails.classList.remove('hidden');
                    document.getElementById('viewItemRenter').textContent = item.rentedTo;
                    document.getElementById('viewItemContact').textContent = item.renterContact;
                    document.getElementById('viewItemRentalDate').textContent = formatDate(item.rentalDate);
                    document.getElementById('viewItemDueDate').textContent = formatDate(item.dueDate);
                    
                    actionButton.textContent = 'Return Item';
                    actionButton.className = 'px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white';
                    actionButton.onclick = () => {
                        closeViewItemModal();
                        openReturnItemModal(item.id);
                    };
                }
                
                viewItemModal.classList.remove('hidden');
            }
        }
        
        function closeViewItemModal() {
            viewItemModal.classList.add('hidden');
        }
        
        // Form handlers
        function handleAddItem(e) {
            e.preventDefault();
            
            const newItem = {
                id: generateId(),
                name: document.getElementById('itemName').value.trim(),
                category: document.getElementById('itemCategory').value,
                description: document.getElementById('itemDescription').value.trim(),
                status: 'available',
                addedDate: new Date().toISOString()
            };
            
            inventoryItems.push(newItem);
            saveInventory();
            closeAddItemModal();
            renderInventoryTable();
            updateCounters();
            checkEmptyState();
        }
        
        function handleRentItem(e) {
            e.preventDefault();
            
            const itemId = document.getElementById('rentItemId').value;
            const itemIndex = inventoryItems.findIndex(item => item.id === itemId);
            
            if (itemIndex !== -1) {
                inventoryItems[itemIndex].status = 'rented';
                inventoryItems[itemIndex].rentedTo = document.getElementById('renterName').value.trim();
                inventoryItems[itemIndex].renterContact = document.getElementById('renterContact').value.trim();
                inventoryItems[itemIndex].rentalDate = new Date().toISOString();
                inventoryItems[itemIndex].dueDate = new Date(document.getElementById('dueDate').value).toISOString();
                
                saveInventory();
                closeRentItemModal();
                renderInventoryTable();
                updateCounters();
            }
        }
        
        function handleReturnItem(e) {
            e.preventDefault();
            
            const itemId = document.getElementById('returnItemId').value;
            const itemIndex = inventoryItems.findIndex(item => item.id === itemId);
            
            if (itemIndex !== -1) {
                const item = inventoryItems[itemIndex];
                
                // Create rental history entry if it doesn't exist
                if (!item.rentalHistory) {
                    item.rentalHistory = [];
                }
                
                // Add current rental to history
                item.rentalHistory.push({
                    rentedTo: item.rentedTo,
                    renterContact: item.renterContact,
                    rentalDate: item.rentalDate,
                    dueDate: item.dueDate,
                    returnDate: new Date().toISOString(),
                    condition: document.getElementById('returnCondition').value,
                    notes: document.getElementById('returnNotes').value.trim()
                });
                
                // Reset rental information
                item.status = 'available';
                delete item.rentedTo;
                delete item.renterContact;
                delete item.rentalDate;
                delete item.dueDate;
                
                saveInventory();
                closeReturnItemModal();
                renderInventoryTable();
                updateCounters();
            }
        }
        
        // Utility functions
        function generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        }
        
        function saveInventory() {
            localStorage.setItem('inventoryItems', JSON.stringify(inventoryItems));
        }
        
        function formatDate(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleDateString();
        }
        
        function checkEmptyState() {
            const emptyState = document.getElementById('emptyState');
            if (inventoryItems.length === 0) {
                emptyState.classList.remove('hidden');
            } else {
                emptyState.classList.add('hidden');
            }
        }
        
        function updateCounters() {
            const availableCount = inventoryItems.filter(item => item.status === 'available').length;
            const rentedCount = inventoryItems.filter(item => item.status === 'rented').length;
            const totalCount = inventoryItems.length;
            
            document.getElementById('availableCount').textContent = availableCount;
            document.getElementById('rentedCount').textContent = rentedCount;
            document.getElementById('totalCount').textContent = totalCount;
        }
        
        function renderInventoryTable() {
            const tableBody = document.getElementById('inventoryTableBody');
            const searchTerm = searchInput.value.toLowerCase();
            const statusFilter = filterStatus.value;
            
            // Filter items based on search and status
            const filteredItems = inventoryItems.filter(item => {
                const matchesSearch = item.name.toLowerCase().includes(searchTerm) || 
                                     (item.rentedTo && item.rentedTo.toLowerCase().includes(searchTerm));
                
                const matchesStatus = statusFilter === 'all' || 
                                     (statusFilter === 'available' && item.status === 'available') ||
                                     (statusFilter === 'rented' && item.status === 'rented');
                
                return matchesSearch && matchesStatus;
            });
            
            // Sort items: rented items first, then by name
            filteredItems.sort((a, b) => {
                if (a.status !== b.status) {
                    return a.status === 'rented' ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
            });
            
            // Clear table
            tableBody.innerHTML = '';
            
            // Add rows for filtered items
            filteredItems.forEach(item => {
                const row = document.createElement('tr');
                row.className = 'border-b hover:bg-gray-50';
                
                // Item name cell
                const nameCell = document.createElement('td');
                nameCell.className = 'py-3 px-4';
                const nameLink = document.createElement('a');
                nameLink.href = '#';
                nameLink.className = 'font-medium text-indigo-600 hover:text-indigo-800';
                nameLink.textContent = item.name;
                nameLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    openViewItemModal(item.id);
                });
                nameCell.appendChild(nameLink);
                row.appendChild(nameCell);
                
                // Category cell
                const categoryCell = document.createElement('td');
                categoryCell.className = 'py-3 px-4';
                categoryCell.textContent = item.category;
                row.appendChild(categoryCell);
                
                // Status cell
                const statusCell = document.createElement('td');
                statusCell.className = 'py-3 px-4';
                const statusBadge = document.createElement('span');
                if (item.status === 'available') {
                    statusBadge.className = 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800';
                    statusBadge.textContent = 'Available';
                } else {
                    statusBadge.className = 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800';
                    statusBadge.textContent = 'Rented Out';
                }
                statusCell.appendChild(statusBadge);
                row.appendChild(statusCell);
                
                // Rented To cell
                const rentedToCell = document.createElement('td');
                rentedToCell.className = 'py-3 px-4';
                rentedToCell.textContent = item.rentedTo || '-';
                row.appendChild(rentedToCell);
                
                // Rental Date cell
                const rentalDateCell = document.createElement('td');
                rentalDateCell.className = 'py-3 px-4';
                rentalDateCell.textContent = item.rentalDate ? formatDate(item.rentalDate) : '-';
                row.appendChild(rentalDateCell);
                
                // Due Date cell
                const dueDateCell = document.createElement('td');
                dueDateCell.className = 'py-3 px-4';
                if (item.dueDate) {
                    const dueDate = new Date(item.dueDate);
                    const today = new Date();
                    const isOverdue = dueDate < today && item.status === 'rented';
                    
                    if (isOverdue) {
                        dueDateCell.innerHTML = `<span class="text-red-600 font-medium">${formatDate(item.dueDate)} (Overdue)</span>`;
                    } else {
                        dueDateCell.textContent = formatDate(item.dueDate);
                    }
                } else {
                    dueDateCell.textContent = '-';
                }
                row.appendChild(dueDateCell);
                
                // Actions cell
                const actionsCell = document.createElement('td');
                actionsCell.className = 'py-3 px-4';
                
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'flex space-x-2';
                
                if (item.status === 'available') {
                    const rentButton = document.createElement('button');
                    rentButton.className = 'px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700';
                    rentButton.textContent = 'Rent Out';
                    rentButton.addEventListener('click', () => openRentItemModal(item.id));
                    actionsDiv.appendChild(rentButton);
                } else {
                    const returnButton = document.createElement('button');
                    returnButton.className = 'px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700';
                    returnButton.textContent = 'Return';
                    returnButton.addEventListener('click', () => openReturnItemModal(item.id));
                    actionsDiv.appendChild(returnButton);
                }
                
                const viewButton = document.createElement('button');
                viewButton.className = 'px-3 py-1 border border-gray-300 text-gray-600 text-xs rounded hover:bg-gray-100';
                viewButton.textContent = 'View';
                viewButton.addEventListener('click', () => openViewItemModal(item.id));
                actionsDiv.appendChild(viewButton);
                
                actionsCell.appendChild(actionsDiv);
                row.appendChild(actionsCell);
                
                tableBody.appendChild(row);
            });
            
            // Show empty message if no items match filters
            if (filteredItems.length === 0 && inventoryItems.length > 0) {
                const emptyRow = document.createElement('tr');
                const emptyCell = document.createElement('td');
                emptyCell.colSpan = 7;
                emptyCell.className = 'py-8 text-center text-gray-500';
                emptyCell.textContent = 'No items match your search criteria';
                emptyRow.appendChild(emptyCell);
                tableBody.appendChild(emptyRow);
            }
        }
        
        // Add sample data if inventory is empty (for demo purposes)
        function addSampleData() {
            if (inventoryItems.length === 0) {
                const sampleItems = [
                    {
                        id: generateId(),
                        name: 'Projector',
                        category: 'Electronics',
                        description: 'HD projector with HDMI input',
                        status: 'available',
                        addedDate: new Date().toISOString()
                    },
                    {
                        id: generateId(),
                        name: 'Drill',
                        category: 'Tools',
                        description: 'Cordless power drill',
                        status: 'rented',
                        rentedTo: 'John Smith',
                        renterContact: '555-1234',
                        rentalDate: new Date().toISOString(),
                        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: generateId(),
                        name: 'Folding Table',
                        category: 'Furniture',
                        description: '6-foot folding table',
                        status: 'available',
                        addedDate: new Date().toISOString()
                    }
                ];
                
                inventoryItems = sampleItems;
                saveInventory();
                renderInventoryTable();
                updateCounters();
                checkEmptyState();
            }
        }
        
        // Uncomment to add sample data
        // addSampleData();
    </script>
<script>(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'93ffb67020d1857f',t:'MTc0NzI4MTQ2Mi4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();