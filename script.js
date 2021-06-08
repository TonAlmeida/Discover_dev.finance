const modalOverlay = document.querySelector(`[data-modal-overlay]`);
const newTransactionButton = document.querySelector(`[data-new-transaction]`);
const cancelButton = document.querySelector(`[data-cancel-button]`);
const saveFormButton = document.querySelector(`[data-save-form-button]`);
const entries = document.querySelector(`[data-entries]`);
const outflows = document.querySelector(`[data-outflows]`);
const total = document.querySelector(`[data-total]`);
const dataNumberInput = document.querySelector(`[data-number-input]`);

const toggle = {
    open() {
        modalOverlay.classList.add(`active`)
    },
    close() {
        modalOverlay.classList.remove(`active`)
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem(`dev.finance`)) || [];
    },
    set(transactions) {
        localStorage.setItem(`dev.finance`, JSON.stringify(transactions));
    }
}

const Transaction = {
    all: Storage.get(),
    add(transaction) {
        Transaction.all.push(transaction);

        App.reload();
    },
    remove(index) {
        Transaction.all.splice(index, 1);

        App.reload();
    }, 
    incomes() {
        let sumIncomes = 0;
        this.all.forEach(transaction => {
            if(transaction.amount > 0) sumIncomes += transaction.amount;
        })
        return sumIncomes;
    },
    expenses() {
        let sumExpenses = 0;
        this.all.forEach(transaction => {
            if(transaction.amount < 0) sumExpenses += transaction.amount;
        })
        return sumExpenses;
    },
    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
};

const shiftHtml = {
    transactionsContainer: document.querySelector(`#data-table tbody`),
    addTransaction(transaction, index) {//adding transactions
        const tr = document.createElement(`tr`);
        tr.innerHTML = shiftHtml.innerHtmlTransactions(transaction, index);

        
        shiftHtml.transactionsContainer.appendChild(tr);
    },
    innerHtmlTransactions(transaction, index) {//transactions content default
        const CssClass = transaction.amount > 0 ? `income` : `expense`;
        const amount = Utils.formatCurrency(transaction.amount);
        const html = `
        <tr>
        <td class="description">${transaction.description}</td>
        <td class="${CssClass}">${amount}</td>
        <td class="data">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="remove transaction">
        </td>
        </tr>
        `
        return html;
    },
    updateBalance() {
        entries.innerHTML = Utils.formatCurrency(Transaction.incomes());
        outflows.innerHTML = Utils.formatCurrency(Transaction.expenses());
        total.innerHTML = Utils.formatCurrency(Transaction.total());
    },
    clearTransactions() {
        shiftHtml.transactionsContainer.innerHTML = ``;
    }
};

const Utils = {
    formatDate(date) {
        let splitDate = date.split(`-`);
        return `${splitDate[2]}-${splitDate[1]}-${splitDate[0]}`
    },

    formatAmount(value) {
        value = Math.round(Number(value) * 100)
        return value;
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? `-` : ``;
        value = String(value).replace(/\D/g, ``);
        value = Number(value) / 100;
        value = value.toLocaleString(`pt-BR`, {style: "currency", currency: "USD"})
        return signal.concat(value);
    }
}

const SaveForm = {
    description: document.querySelector(`input#description`),
    amount: document.querySelector(`input#amount`),
    date: document.querySelector(`input#data`),


    getValues() {
        return {
            description: SaveForm.description.value,
            amount: SaveForm.amount.value,
            date: SaveForm.date.value,
        }
    },
    ValidateFields() {
        const {description, amount, date} = SaveForm.getValues();
        if( description.trim() === `` ||
            amount.trim() === `` ||
            date.trim() === ``
        ) {
            throw new Error(`Please, fill all fields`);
        }
    },

    formatValues() {
        let {description, amount, date} = SaveForm.getValues();
        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);
        return {
            description,
            amount,
            date
        }
    },

    saveTransaction(transactionInformation) {
        Transaction.add(transactionInformation);
    },

    clearFields() {
        this.description.value = ``,
        this.amount.value = ``;
        this.date.value = ``;
    },

    submit(event) {
        event.preventDefault()
        
        try {
            this.ValidateFields();
            this.formatValues();
            const transactionInformation = this.formatValues();
            this.saveTransaction(transactionInformation);
            this.clearFields();
            toggle.close();
            App.reload();

        } catch(error) {
            alert(error.message);
        }
        
    }
}

const App = {
    init() {
        Transaction.all.forEach(shiftHtml.addTransaction)
        shiftHtml.updateBalance();//updating display balance
        Storage.set(Transaction.all);//saving in localStorage
    }, 
    reload() {
        shiftHtml.clearTransactions();
        App.init();
    }
}

App.init();

