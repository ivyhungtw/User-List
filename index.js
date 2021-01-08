//////// Variables ////////
const BASE_URL = 'https://lighthouse-user-api.herokuapp.com/api/v1/users/'
const USERS_PER_PAGE = 24
const BASE_REGION_URL = 'https://restcountries.eu/rest/v2/alpha/'

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const modeContainer = document.querySelector('#mode-container')
const listMode = document.querySelector('#listMode')
const cardMode = document.querySelector('#cardMode')

let filteredUsers = []
const users = []
let currentPage = 1
let currentMode = 'card'
const userMap = {}

//////// Functions ////////
function displayUsers(data) {
  return currentMode === 'card'
    ? renderUserByCard(data)
    : renderUserByList(data)
}

function renderUserByCard(data) {
  const favUsers = JSON.parse(localStorage.getItem('favUsers')) || []
  let htmlContent = ''
  data.forEach(item => {
    htmlContent += `
    <div class="col-12 col-sm-6 col-lg-3 mb-4">
      <div class="card pb-2">
        <div class="add mx-4 mt-2 d-flex justify-content-end">
          <i class="fa${
            favUsers.some(user => user.id === item.id) ? 's' : 'r'
          } fa-heart fa-lg heart mt-3 btn-add-favorite" data-id="${
      item.id
    }"></i>
         
        </div>
        <div class="user-img px-5 py-3">
          <img src="${
            item.avatar
          }" class="img-show-user btn-show-user rounded-circle card-img-top mx-auto img-fluid" alt="..." data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${
      item.id
    }">
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

function renderUserByList(data) {
  const favUsers = JSON.parse(localStorage.getItem('favUsers')) || []
  let htmlContent = ''
  data.forEach(item => {
    htmlContent += `
        <li
            class="list-group-item d-flex justify-content-between align-items-center"
          >
            <div class="user-container d-flex align-items-center">
              <div class="user-img d-flex justify-content-center">
                <img
                  src="${item.avatar}"
                  class="img-show-user btn-show-user rounded-circle card-img-top mx-auto img-fluid"
                  alt="..."
                  data-bs-toggle="modal"
                  data-bs-target="#user-modal"
                  data-id="${item.id}"
                />
              </div>
              <h5>${item.name}</h5>
            </div>

            <div class="btn">
              <button
                class="btn btn-primary btn-show-user me-3"
                data-bs-toggle="modal" data-bs-target="#user-modal"
                data-id="${item.id}"
              >
                More
              </button>
              <i
                class="fa${
                  favUsers.some(user => user.id === item.id) ? 's' : 'r'
                } fa-heart fa-lg heart mt-3 btn-add-favorite"
                data-id="${item.id}"
              ></i>
            </div>
          </li>
    `
  })
  dataPanel.innerHTML = `
    <ul class="list-group list-group-flush">
      ${htmlContent}
    </ul>
  `
}

function showUserModal(id) {
  const userName = document.querySelector('#user-modal-name')
  const userImg = document.querySelector('#user-modal-img')
  const userInfo = document.querySelector('#user-modal-info')
  const userUpdate = document.querySelector('#user-modal-update')

  const user = userMap[id]
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

function addToFav(id) {
  const favUsers = JSON.parse(localStorage.getItem('favUsers')) || []
  // 如果 id 已經在 favUsers 裡就跳出警告
  if (favUsers.some(user => user.id === id)) {
    return alert('此使用者已經在收藏清單中！')
  }
  // 比對 data-id 與 users 的 id 屬性
  // 儲存回傳值至 favUsers
  favUsers.push(users.find(user => user.id === id))
  // 儲存 favUsers 至 local storage
  localStorage.setItem('favUsers', JSON.stringify(favUsers))
}

function getUsersByPage(page) {
  const startIndex = (page - 1) * USERS_PER_PAGE
  const data = filteredUsers.length ? filteredUsers : users
  return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}

function renderPaginator(users) {
  // set first page as active page
  let htmlContent = `
            <li class="page-item active">
              <a class="page-link" href="#" data-page="1">1</a>
            </li>
    `
  // loop through 2 ~ users/12
  for (let i = 2; i <= Math.ceil(users.length / USERS_PER_PAGE); i++) {
    htmlContent += `
            <li class="page-item ">
              <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
    `
  }
  paginator.innerHTML = htmlContent
}

// card hover
function cardHover(e) {
  const card = e.target.closest('.card')
  card.classList.toggle('card-shadow')
}

//////// Initialization ////////

// Render User List
axios
  .get(BASE_URL)
  .then(response => {
    users.push(...response.data.results)
    /* 新增 */
    users.forEach(user => {
      userMap[user.id] = user
    })
    displayUsers(getUsersByPage(1))
    renderPaginator(users)
  })
  .catch(error => console.log(error))

//////// Event Listener ////////
dataPanel.addEventListener('click', function (e) {
  if (
    e.target.matches('.img-show-user') ||
    e.target.matches('.btn-show-user')
  ) {
    const data = e.target.dataset.id
    showUserModal(data)
  } else if (e.target.matches('.btn-add-favorite')) {
    addToFav(Number(e.target.dataset.id))
    // 改變 icon 樣式
    e.target.classList.remove('far')
    e.target.classList.add('fas')
  }
})

// 將搜尋表單綁定提交事件，觸發搜尋功能
searchForm.addEventListener('submit', function (e) {
  e.preventDefault()
  currentPage = 1
  // 取得 input value
  const keyword = searchInput.value.trim().toLowerCase()
  // 比對 input value 與 users 的 name 屬性，回傳新陣列
  filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(keyword)
  )
  // edge case
  if (filteredUsers.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的使用者`)
  }
  // 重新 render 畫面
  displayUsers(getUsersByPage(1))
  renderPaginator(filteredUsers)
})

paginator.addEventListener('click', function (e) {
  if (!e.target.matches('a')) return
  e.preventDefault()
  // scroll to the top of the data panel
  dataPanel.scrollIntoView({ behavior: 'smooth' })
  currentPage = e.target.dataset.page
  displayUsers(getUsersByPage(currentPage))
  // activate current page
  const siblings = e.target.closest('#paginator').querySelectorAll('li')
  siblings.forEach(el => {
    el !== e.target.parentElement
      ? el.classList.remove('active')
      : el.classList.add('active')
  })
  // e.target.parentElement.classList.add('active')
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

modeContainer.addEventListener('click', function (e) {
  if (e.target.tagName !== 'I' || e.target.dataset.mode === currentMode) return
  // change current mode
  currentMode = e.target.dataset.mode
  // render user list
  displayUsers(getUsersByPage(currentPage))

  const siblings = e.target.closest('#mode-container').querySelectorAll('i')
  siblings.forEach(el => {
    el.classList.toggle('mode-active')
  })
})
