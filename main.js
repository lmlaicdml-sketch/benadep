
const support = document.querySelector('.support .cha2')
const supportX = document.querySelectorAll('.close-support')
const supportOpen = document.querySelectorAll('.open-support')

function closeSupport() {
    support.classList.add('haha')
}

for (const supportOf of supportX) {
    supportOf.addEventListener('click', closeSupport)
}

function openSupport() {
    support.classList.remove('haha')
}

for (const supportOp of supportOpen) {
    supportOp.addEventListener('click', openSupport)
}