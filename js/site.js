const processForm = (event) => {
    event.preventDefault();
    const inputForm = document.querySelector(".input-form");
    const parsedData = new FormData(inputForm);
    let formEntries = Object.fromEntries(parsedData.entries());
    formEntries = convertToNumbers(formEntries);
    const formOk = validateEntries(formEntries);
    let summary = calculateSummary(formEntries);
    let payments = calculatePayments(formEntries);
    console.log(payments);
    // displayPayments(payments);

    if (formOk && formEntries.targetPayment) {
       displayDownPaymentSummary(summary);
    } else if (formOk) {
       displaySummary(summary);
    }
}

const calculatePayments = entries => {
    const {loanAmount, termLength, interestRate, targetPayment} = entries;
    let remainingPrincipal = loanAmount;
    let totalInterest = 0;
    const monthlyPayment = ((loanAmount * (interestRate/1200)) / (1 - (1 + interestRate/1200) ** (-1*termLength))).toFixed(2);
    const tableData = [];

    for (let i = 0; i < termLength; i++) {
        const breakdown = {
            month: 0,
            payment: 0,
            principal: 0,
            interest: 0,
            totalInterest: 0,
            balance: 0
        }

        breakdown.month = i + 1;
        breakdown.interest = (interestRate/1200) * remainingPrincipal;
        totalInterest += breakdown.interest;
        breakdown.totalInterest = totalInterest;
        breakdown.payment = Number(monthlyPayment);
        breakdown.principal = monthlyPayment - breakdown.interest;
        remainingPrincipal -= breakdown.principal;
        breakdown.balance = remainingPrincipal;

        tableData.push(breakdown);
    }

    return tableData;
}

const calculateSummary = entries => {
    const {loanAmount, termLength, interestRate, targetPayment} = entries;
    const summary = {
        monthlyPayment: 0, 
        principal: 0, 
        interest: 0, 
        totalCost: 0, 
        downPayment: 0
    };

    if (!targetPayment) {
        summary.monthlyPayment = ((loanAmount * (interestRate/1200)) / (1 - (1 + interestRate/1200) ** (-1*termLength))).toFixed(2);
        summary.principal = loanAmount;
        summary.totalCost = (summary.monthlyPayment * termLength);
        summary.interest = (summary.totalCost - summary.principal);
    }
    return summary; 
}

const displaySummary = summary => {
    const {monthlyPayment, principal, interest, totalCost, downPayment} = summary;
    const detailsSection = document.getElementById('detailsSection');
    detailsSection.innerHTML = '';
    const detailsTemplate = document.getElementById('detailsTemplate');
    const detailsElement = detailsTemplate.content.cloneNode(true);
    const paymentAmount = detailsElement.querySelector('.payment-headline-amount');
    const principalAmount = detailsElement.getElementById('principalAmount');
    const interestAmount = detailsElement.getElementById('interestAmount');
    const costAmount = detailsElement.getElementById('costAmount');
    const finalAmount = detailsElement.getElementById('finalAmount');
    paymentAmount.innerText = `$${monthlyPayment.toLocaleString()}`;
    principalAmount.innerText = `$${principal.toLocaleString()}`;
    interestAmount.innerText = `$${interest.toLocaleString()}`;
    costAmount.innerText = `$${totalCost.toLocaleString()}`;
    finalAmount.innerText = `$${downPayment.toLocaleString()}`;
    detailsSection.appendChild(detailsElement);
}

const convertToNumbers = entries => {
    const refinedEntries = {
        loanAmount: Number(entries.loanAmount),
        termLength: Number(entries.termLength),
        interestRate: Number(entries.interestRate),
    }
    
    if (entries.targetPayment) {
        refinedEntries.targetPayment = Number(entries.targetPayment);
    } else {
        refinedEntries.targetPayment = "";
    }

    return refinedEntries;
}

const validateEntries = entries => {
    const {loanAmount, termLength, interestRate, targetPayment} = entries;
    const loanOk = !isNaN(loanAmount) && loanAmount > 0;
    const termOk = Number.isInteger(termLength) && termLength > 0;
    const interestOk = !isNaN(interestRate) && interestRate > 0;
    const targetOk = Number.isInteger(targetPayment) || targetPayment == "";
    
    if (!loanOk) {
        showError('Please enter a valid loan amount.');
    } else if (!termOk) {
        showError('Please enter a valid term.');
    } else if (!interestOk) {
        showError('Please enter a valid interest rate.');
    } else if (!targetOk) {
        showError('Please enter a valid target rate.');
    } else {
        return true;
    }
}

const showError = error => {
    Swal.fire({
        backdrop: false,
        title: 'Oops!',
        text: error,
        icon: 'error',
        confirmButtonColor: '#253439'
    })
}