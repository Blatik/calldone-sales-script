const quizData = [
    {
        id: 'intro',
        type: 'intro',
        title: 'Отримайте персональну пропозицію CallDone AI',
        text: 'Дайте відповідь на 3 прості запитання, щоб дізнатися, який тариф ідеально підходить для вашого бізнесу та скільки ви зможете заощадити.',
        buttonText: 'Розрахувати тариф'
    },
    {
        id: 'q1',
        type: 'question',
        title: 'Скільки менеджерів у вашому відділі продажу?',
        options: [
            { text: '1 менеджер', value: 'small' },
            { text: '2-5 менеджерів', value: 'medium' },
            { text: '6-10 менеджерів', value: 'large' },
            { text: 'Більше 10 менеджерів', value: 'enterprise' }
        ]
    },
    {
        id: 'q2',
        type: 'question',
        title: 'Яка орієнтовна загальна тривалість розмов в місяць?',
        options: [
            { text: 'До 600 хвилин', value: 600 },
            { text: '600 - 1600 хвилин', value: 1600 },
            { text: '1600 - 4500 хвилин', value: 4500 },
            { text: 'Більше 4500 хвилин', value: 10000 }
        ]
    },
    {
        id: 'q3',
        type: 'question',
        title: 'Як ви зараз контролюєте якість дзвінків?',
        options: [
            { text: 'Не контролюю / Немає часу', value: 'pain_time' },
            { text: 'Слухаю вибірково сам', value: 'pain_manual' },
            { text: 'Є Тімлід / РОП', value: 'pain_cost' },
            { text: 'Є відділ контролю якості', value: 'pain_high_cost' }
        ]
    }
];

const plans = {
    starter: {
        name: 'Starter',
        price: '20 €',
        limit: 606,
        minutes: '606 хв',
        rate: '0.033 €/хв',
        desc: 'Ідеальний старт для малого бізнесу або одного менеджера.'
    },
    basic: {
        name: 'Basic',
        price: '50 €',
        limit: 1667,
        minutes: '1 667 хв',
        rate: '0.03 €/хв',
        desc: 'Оптимальний вибір для невеликої команди продажів.'
    },
    standard: {
        name: 'Standard',
        price: '100 €',
        limit: 4500,
        minutes: '4 500 хв',
        rate: '0.022 €/хв',
        desc: 'Найпопулярніший тариф для активних відділів продажу.'
    },
    business: {
        name: 'Business',
        price: '200 €',
        limit: 10000,
        minutes: '10 000 хв',
        rate: '0.02 €/хв',
        desc: 'Максимальна вигода для великих обсягів дзвінків.'
    }
};

let currentStep = 0;
let answers = {};

const card = document.getElementById('quiz-card');
const progressBar = document.getElementById('progress-bar');

function initQuiz() {
    renderStep();
}

function renderStep() {
    const step = quizData[currentStep];

    // Update Progress Bar
    const progress = (currentStep / (quizData.length)) * 100;
    progressBar.style.width = `${progress}%`;

    card.innerHTML = ''; // Clear card

    if (step.type === 'intro') {
        renderIntro(step);
    } else if (step.type === 'question') {
        renderQuestion(step);
    } else {
        // Should not happen normally as we handle finish separately
    }
}

function renderIntro(step) {
    card.innerHTML = `
        <h2>${step.title}</h2>
        <p>${step.text}</p>
        <button class="btn-primary" onclick="nextStep()">${step.buttonText}</button>
    `;
}

function renderQuestion(step) {
    const title = document.createElement('h2');
    title.textContent = step.title;

    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-grid';

    step.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'btn-option';
        btn.innerHTML = `<span>${opt.text}</span> <span>→</span>`;
        btn.onclick = () => handleAnswer(step.id, opt.value);
        optionsContainer.appendChild(btn);
    });

    card.appendChild(title);
    card.appendChild(optionsContainer);
}

function handleAnswer(questionId, value) {
    answers[questionId] = value;
    nextStep();
}

function nextStep() {
    currentStep++;
    if (currentStep < quizData.length) {
        renderStep();
    } else {
        showResult();
    }
}

function showResult() {
    // 100% Progress
    progressBar.style.width = '100%';

    // Logic to determine plan
    let recommendedPlanKey = 'starter';
    const minutesVal = Number(answers['q2']); // Ensure it's a number

    // Find the smallest plan that covers the minutesVal
    // Sort plans by limit to ensure correct order check
    const sortedPlanKeys = Object.keys(plans).sort((a, b) => plans[a].limit - plans[b].limit);

    for (const key of sortedPlanKeys) {
        if (plans[key].limit >= minutesVal) {
            recommendedPlanKey = key;
            break;
        }
    }
    // If minutesVal is greater than highest limit, it stays on the last one checked (conceptually business) 
    // but the loop breaks on finding >=. If > 10000, we might want to default to Business or custom. 
    // For now, if > 10000, the loop finishes without break? No, we default 'starter' but we should default to 'business' if none matched.

    if (minutesVal > plans['business'].limit) {
        recommendedPlanKey = 'business';
    } else {
        // Double check loop logic
        // If 600: Starter (606 >= 600) -> Break. Recommended: Starter.
        // If 4500: Standard (4500 >= 4500) -> Break. Recommended: Standard.
    }

    const plan = plans[recommendedPlanKey];

    card.innerHTML = `
        <h2>Ваш ідеальний тариф</h2>
        <div class="result-plan">${plan.name}</div>
        <div class="result-price">${plan.price} <span style="font-size: 1rem; color: var(--text-secondary); font-weight: normal;">/ міс</span></div>
        <p>${plan.desc}</p>
        
        <div class="feature-list">
            <div class="feature-item">
                <span class="feature-icon">✓</span>
                <span>Включено хвилин: <strong>${plan.minutes}</strong></span>
            </div>
            <div class="feature-item">
                <span class="feature-icon">✓</span>
                <span>Ціна за хвилину: <strong>${plan.rate}</strong></span>
            </div>
            <div class="feature-item">
                <span class="feature-icon">✓</span>
                <span>Аналіз 100% дзвінків</span>
            </div>
            <div class="feature-item">
                <span class="feature-icon">✓</span>
                <span>AI-рекомендації менеджерам</span>
            </div>
        </div>

        <div class="contact-form">
            <h3>Залиште контакти для підключення</h3>
            <form id="lead-form" onsubmit="submitLead(event)">
                <div class="form-group">
                    <label for="phone">Номер телефону</label>
                    <input type="tel" id="phone" name="phone" placeholder="+380..." required>
                </div>
                <div class="form-group">
                    <label for="telegram">Telegram</label>
                    <input type="text" id="telegram" name="telegram" placeholder="@username" required>
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" placeholder="name@company.com" required>
                </div>
                <div class="form-group">
                    <label for="company">Назва або ніша компанії</label>
                    <input type="text" id="company" name="company" placeholder="Наприклад: Нерухомість, Call-center..." required>
                </div>
                
                <button type="submit" class="btn-primary" style="width: 100%;">Відправити заявку</button>
            </form>
        </div>
        
        <br>
        <button onclick="location.reload()" style="background:none; border:none; color: var(--text-secondary); margin-top: 15px; cursor: pointer; text-decoration: underline;">Пройти ще раз</button>
    `;
}

function submitLead(e) {
    e.preventDefault();

    // Collect data
    const formData = {
        phone: document.getElementById('phone').value,
        telegram: document.getElementById('telegram').value,
        email: document.getElementById('email').value,
        company: document.getElementById('company').value,
        quiz_answers: answers
    };

    console.log("Lead captured:", formData);

    // Simulate submission
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = "Відправка...";

    setTimeout(() => {
        card.innerHTML = `
            <div style="text-align: center;">
                <h2 style="color: var(--success-color);">Дякуємо!</h2>
                <p>Ваша заявка успішно прийнята.</p>
                <div style="font-size: 4rem; margin: 30px 0;">✅</div>
                <p>Наш менеджер зв'яжеться з вами в Telegram або за телефоном найближчим часом.</p>
                <a href="https://calldone.ai" class="btn-primary">Перейти на сайт</a>
            </div>
        `;
    }, 1500);
}

// Start
initQuiz();
