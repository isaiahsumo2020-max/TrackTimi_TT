import re

with open('frontend/src/views/admin/EmployeeManagement.vue', 'r') as f:
    content = f.read()

# Fix toggleSelectAll checkboxes
content = content.replace(
    '<input type="checkbox" @change="toggleSelectAll" :checked="allSelected" class="rounded">',
    '<input type="checkbox" @change="toggleSelectAll" :checked="allSelected" aria-label="Select all employees" class="rounded">'
)

# Fix toggleSelectEmployee checkboxes
content = content.replace(
    '<input type="checkbox" @change="toggleSelectEmployee(employee.User_ID)" :checked="selectedEmployees.includes(employee.User_ID)" class="rounded">',
    '<input type="checkbox" @change="toggleSelectEmployee(employee.User_ID)" :checked="selectedEmployees.includes(employee.User_ID)" :aria-label="`Select ${employee.First_Name} ${employee.SurName}`" class="rounded">'
)

with open('frontend/src/views/admin/EmployeeManagement.vue', 'w') as f:
    f.write(content)

print('✅ Fixed checkboxes with aria-labels')
