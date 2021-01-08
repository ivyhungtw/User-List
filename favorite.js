//////// Variables ////////
const BASE_URL = 'https://lighthouse-user-api.herokuapp.com/api/v1/users/'
const USERS_PER_PAGE = 24
const dataPanel = document.querySelector('#data-panel')
const paginator = document.querySelector('#paginator')
const favUsers = JSON.parse(localStorage.getItem('favUsers')) || []
const favUsersMap = {}

//////// Functions ////////
function renderUserList(data) {
  let htmlContent = ''
  data.forEach(item => {
    htmlContent += `
    <div class="col-6 col-lg-3 mb-4">
      <div class="card pb-2">
        <div class="add mx-4 mt-2 d-flex justify-content-end">
          <i class="fas fa-heart fa-lg heart mt-3 btn-remove-favorite" data-id="${item.id}"></i>
        </div>
        <div class="user-img px-5 py-3">
          <img src="${item.avatar}" class="img-show-user btn-show-user rounded-circle card-img-top mx-auto img-fluid" alt="..." data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${item.id}">
        </div>
        <div class="card-body">
          <h5 class="card-title text-center">${item.name}</h5>
        </div>
      </div>
    </div>
  `
  })
  dataPanel.innerHTML = htmlContent
}

function renderPaginator(data) {
  let htmlContent = ''
  for (let i = 1; i <= Math.ceil(data.length / USERS_PER_PAGE); i++) {
    htmlContent += `
            <li class="page-item">
              <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
    `
  }
  paginator.innerHTML = htmlContent
}

function showUserModal(id) {
  const userName = document.querySelector('#user-modal-name')
  const userImg = document.querySelector('#user-modal-img')
  const userInfo = document.querySelector('#user-modal-info')
  const userUpdate = document.querySelector('#user-modal-update')

  const user = favUsersMap[id]
  userName.innerText = `${user.name} ${user.surname}`
  userImg.innerHTML = `
      <img src="${user.avatar}" alt="User Photo">
    `
  userInfo.innerHTML = `
              <li class="list-group-item">Region: ${user.region}</li>
              <li class="list-group-item">Gender: ${user.gender} </li>
              <li class="list-group-item">Age: ${user.age}</li>
              <li class="list-group-item">Birthday: ${user.birthday}</li>
              <li class="list-group-item">Email: ${user.email}</li>
    `
}

function removeUser(id) {
  if (!favUsers) return
  const index = favUsers.findIndex(user => user.id === id)
  if (index === -1) return
  // delete user
  favUsers.splice(index, 1)
  // reset local storage
  localStorage.setItem('favUsers', JSON.stringify(favUsers))
  // render
  let page = Math.ceil((index + 1) / USERS_PER_PAGE)
  page = favUsers.length % USERS_PER_PAGE ? page : page - 1
  renderUserList(getUsersByPage(page))
  renderPaginator(favUsers)
}

function getUsersByPage(page) {
  const startIndex = (page - 1) * USERS_PER_PAGE
  return favUsers.slice(startIndex, startIndex + USERS_PER_PAGE)
}

// card hover
function cardHover(e) {
  const card = e.target.closest('.card')
  card.classList.toggle('card-shadow')
}

//////// Initialization ////////
favUsers.forEach(user => {
  favUsersMap[user.id] = user
})

renderUserList(getUsersByPage(1))
renderPaginator(favUsers)

//////// Event Listener ////////
dataPanel.addEventListener('click', function (e) {
  if (e.target.matches('.btn-remove-favorite')) {
    removeUser(Number(e.target.dataset.id))
  } else if (e.target.matches('.img-show-user')) {
    showUserModal(e.target.dataset.id)
  }
})

paginator.addEventListener('click', function (e) {
  const page = e.target.dataset.page
  renderUserList(getUsersByPage(page))
})

dataPanel.addEventListener('mouseover', function (e) {
  if (e.target.closest('.card')) {
    cardHover(e)
  }
})

dataPanel.addEventListener('mouseout', function (e) {
  if (e.target.closest('.card')) {
    cardHover(e)
  }
})
