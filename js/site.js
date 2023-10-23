const processForm = (event) => {
    event.preventDefault();
    const inputForm = document.querySelector(".input-form");
    const parsedData = new FormData(inputForm);
    let formEntries = Object.fromEntries(parsedData.entries());
    formEntries = convertToNumbers(formEntries);
    const formOk = validateEntries(formEntries);
    let summary = calculateSummary(formEntries);
    let payments = calculatePayments(summary);
    displayPayments(payments);

    if (formOk && formEntries.targetPayment) {
       displayDownPaymentSummary(summary);
    } else if (formOk) {
       displaySummary(summary);
    }
}

const calculatePayments = summary => {
    const {monthlyPayment, interestRate, totalCost, termLength, principal} = summary;
    let remainingPrincipal = principal;
    let totalInterest = 0;
    const tableData = [];
    let lastPayment = false;

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
        
        if (lastPayment) {
            breakdown.balance = remainingPrincipal;
            breakdown.principal = breakdown.balance;
            breakdown.payment = breakdown.principal + breakdown.interest;    
            remainingPrincipal -= breakdown.principal;
            breakdown.balance = remainingPrincipal;
            tableData.push(breakdown);
            return tableData
        }
        
        breakdown.payment = monthlyPayment;
        breakdown.principal = breakdown.payment - breakdown.interest;
        remainingPrincipal -= breakdown.principal;
        breakdown.balance = remainingPrincipal;
        
        if (breakdown.balance < breakdown.principal) {
            lastPayment = true;
        }
        
        tableData.push(breakdown);
    }
}

const displayPayments = payments => {
    const table = document.getElementById('paymentsTable');

    const tableHeading = table.querySelector('thead');
    const headerTemplate = document.getElementById('tableHeadingTemplate');
    const headerContent = headerTemplate.content.cloneNode(true);
    tableHeading.innerHTML = '';
    tableHeading.appendChild(headerContent);

    const tableBody = table.querySelector('tbody');
    const rowTemplate = document.getElementById('tableRowTemplate');
    tableBody.innerHTML = '';
    for (let i = 0; i < payments.length; i++) {
        const paymentObj = payments[i];
        const {month, payment, principal, interest, totalInterest, balance} = paymentObj;
        const rowContent  = rowTemplate.content.cloneNode(true);
        const monthElement = rowContent.querySelector('.table-month');
        const paymentElement = rowContent.querySelector('.table-payment');
        const principalElement = rowContent.querySelector('.table-principal');
        const totalInterestElement = rowContent.querySelector('.table-total-interest');
        const interestElement = rowContent.querySelector('.table-interest');
        const balanceElement = rowContent.querySelector('.table-balance');
        monthElement.innerText = month;
        paymentElement.innerText = payment.toFixed(2);
        principalElement.innerText = principal.toFixed(2);
        interestElement.innerText = interest.toFixed(2);
        totalInterest.innerText = totalInterest.toFixed(2);
        balanceElement.innerText = balance.toFixed(2);
        totalInterestElement.innerText = totalInterest.toFixed(2);

        tableBody.appendChild(rowContent);
    }

}

const calculateSummary = entries => {
    const {loanAmount, termLength, interestRate, targetPayment} = entries;
    const summary = {
        monthlyPayment: 0, 
        principal: 0, 
        interest: 0, 
        totalCost: 0, 
        downPayment: 0,
        termLength,
        interestRate
    };

    const minimumPayment = ((loanAmount * (interestRate/1200)) / (1 - (1 + interestRate/1200) ** (-1*termLength)));

    if (!targetPayment) {
        summary.monthlyPayment = Number(minimumPayment);
        summary.principal = loanAmount;
        summary.totalCost = (summary.monthlyPayment * termLength);
        summary.interest = (summary.totalCost - summary.principal);
    } else if (minimumPayment > Number(targetPayment)) {
        summary.monthlyPayment = Number(targetPayment);
        const minimumCost = minimumPayment * termLength;
        summary.totalCost = targetPayment * termLength;
        summary.downPayment = minimumCost - summary.totalCost;
        summary.principal = loanAmount - summary.downPayment;
        summary.interest = summary.totalCost - summary.principal;
    } else {
        const alertMessage = `You just need a minimum payment of ${minimumPayment.toFixed(2)}$. To instead opt for ${targetPayment.toFixed(2)}$, consider reducing the term length.`
        showAlert(alertMessage,"Good News", "success")
    }
    return summary; 
}

const displayDownPaymentSummary = summary => {
    const {monthlyPayment, principal, interest, totalCost, downPayment} = summary;
    const detailsSection = document.getElementById('detailsSection');
    detailsSection.innerHTML = '';
    const detailsTemplate = document.getElementById('detailsTemplate');
    const detailsElement = detailsTemplate.content.cloneNode(true);
    const headline = detailsElement.querySelector('.payment-headline');
    const headAmount = detailsElement.querySelector('.payment-headline-amount');
    const principalAmount = detailsElement.getElementById('principalAmount');
    const interestAmount = detailsElement.getElementById('interestAmount');
    const costAmount = detailsElement.getElementById('costAmount');
    const finalAmount = detailsElement.getElementById('finalAmount');
    const finalText = detailsElement.getElementById('finalText');
    headline.innerText = "Your Downpayment:"
    headAmount.innerText = `$${downPayment.toLocaleString()}`;
    principalAmount.innerText = `$${principal.toLocaleString()}`;
    interestAmount.innerText = `$${interest.toLocaleString()}`;
    costAmount.innerText = `$${totalCost.toLocaleString()}`;
    finalAmount.innerText = `$${monthlyPayment.toLocaleString()}`;
    finalText.innerHTML = '<strong>Monthly Payment</strong>'
    detailsSection.appendChild(detailsElement);
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
        showError('Please enter a valid loan amount.', "Oops", "error");
    } else if (!termOk) {
        showError('Please enter a valid term.', "Oops", "error");
    } else if (!interestOk) {
        showError('Please enter a valid interest rate.', "Oops", "error");
    } else if (!targetOk) {
        showError('Please enter a valid target rate.', "Oops", "error");
    } else {
        return true;
    }
}

const showAlert = (message, heading, type) => {
    Swal.fire({
        backdrop: false,
        title: heading,
        text: message,
        icon: type,
        confirmButtonColor: '#253439'
    })
}