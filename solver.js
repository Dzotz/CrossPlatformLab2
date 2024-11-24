  // Function to create dynamic input fields for equations
  function createInputs(numEquations) {
    const container = document.getElementById('inputs-container');
    container.innerHTML = ''; // Clear previous inputs

    for (let i = 0; i < numEquations; i++) {
        for (let j = 0; j < numEquations; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.placeholder = `a[${i + 1}][${j + 1}]`;
            container.appendChild(input);
        }
        const bInput = document.createElement('input');
        bInput.type = 'number';
        bInput.placeholder = `b[${i + 1}]`;
        container.appendChild(bInput);

        container.appendChild(document.createElement('br'));
    }
}

// Extract the matrix A and vector b from the inputs
function extractInputs(numEquations) {
    const container = document.getElementById('inputs-container');
    const inputs = container.querySelectorAll('input');
    const A = [];
    const b = [];

    for (let i = 0; i < numEquations; i++) {
        const row = [];
        for (let j = 0; j < numEquations; j++) {
            row.push(parseFloat(inputs[i * (numEquations + 1) + j].value) || 0);
        }
        A.push(row);
        b.push(parseFloat(inputs[i * (numEquations + 1) + numEquations].value) || 0);
    }
    return { A, b };
}

// Function to solve using Gaussian Elimination
function gaussianElimination(A, b) {
    const n = A.length;
    const augmentedMatrix = A.map((row, i) => [...row, b[i]]);

    for (let i = 0; i < n; i++) {
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(augmentedMatrix[k][i]) > Math.abs(augmentedMatrix[maxRow][i])) {
                maxRow = k;
            }
        }
        [augmentedMatrix[i], augmentedMatrix[maxRow]] = [augmentedMatrix[maxRow], augmentedMatrix[i]];

        for (let k = i + 1; k < n; k++) {
            const factor = augmentedMatrix[k][i] / augmentedMatrix[i][i];
            for (let j = i; j <= n; j++) {
                augmentedMatrix[k][j] -= factor * augmentedMatrix[i][j];
            }
        }
    }

    const x = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        x[i] = augmentedMatrix[i][n] / augmentedMatrix[i][i];
        for (let k = i - 1; k >= 0; k--) {
            augmentedMatrix[k][n] -= augmentedMatrix[k][i] * x[i];
        }
    }
    return x;
}

// Function to solve using Cramer's Rule
function matrixMethod(A, b) {
    const determinant = matrix => {
        const n = matrix.length;
        if (n === 1) return matrix[0][0];
        if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];

        let det = 0;
        for (let i = 0; i < n; i++) {
            const subMatrix = matrix
                .slice(1)
                .map(row => row.filter((_, colIndex) => colIndex !== i));
            det += Math.pow(-1, i) * matrix[0][i] * determinant(subMatrix);
        }
        return det;
    };

    const n = A.length;
    const detA = determinant(A);
    if (detA === 0) throw new Error("System has no unique solution.");

    return A[0].map((_, colIndex) => {
        const modifiedMatrix = A.map((row, i) =>
            row.map((val, j) => (j === colIndex ? b[i] : val))
        );
        return determinant(modifiedMatrix) / detA;
    });
}

// Add event listeners
document.getElementById('generate').addEventListener('click', () => {
    const numEquations = parseInt(document.getElementById('num-equations').value, 10);
    createInputs(numEquations);
});

document.getElementById('solve-gaussian').addEventListener('click', () => {
    const numEquations = parseInt(document.getElementById('num-equations').value, 10);
    const { A, b } = extractInputs(numEquations);
    try {
        const solution = gaussianElimination(A, b);
        document.getElementById('output').innerText = `Solution: ${solution.join(', ')}`;
    } catch (error) {
        document.getElementById('output').innerText = `Error: ${error.message}`;
    }
});

document.getElementById('solve-cramer').addEventListener('click', () => {
    const numEquations = parseInt(document.getElementById('num-equations').value, 10);
    const { A, b } = extractInputs(numEquations);
    try {
        const solution = matrixMethod(A, b);
        document.getElementById('output').innerText = `Solution: ${solution.join(', ')}`;
    } catch (error) {
        document.getElementById('output').innerText = `Error: ${error.message}`;
    }
});