import En from "./lang-en.js"
import Zh from "./lang-zh-tw.js"

const clientId = "93raemk5s5z1jlabhw3ykceasxn8mi"
//i know this shouldn't be here but..
const clientSecret = "959qnr3n1uz1glsv91urs4tzkipceg"
const tokenUrl = `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`

const url = new URL("https://api.twitch.tv/helix/streams")
const streams = document.querySelector(".streams")
const title = document.querySelector("h1")
const buttons = document.querySelectorAll("button")

let token
let lang = "en"
let cursor
let data
let streamsData

// getting app access token
// this kind of token cannot be refreshed(twitch API)
async function getToken() {
  let token = ""
  try {
    const res = await fetch(tokenUrl, { method: "POST" })
    const resp = await res.json()

    token = resp.access_token
    return token
  } catch (error) {
    console.log(error)
  }
}

// fetching streams & cursor
async function getStreams(lang, token, nextCursor = "") {
  const params = { game_id: "21779", after: nextCursor, language: lang }
  url.search = new URLSearchParams(params).toString()

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Client-Id": clientId,
    },
  })
  const data = await res.json()
  cursor = data.pagination.cursor

  return { data, cursor }
}

// how come the stream data doesn't include the avatar???
async function getAvatar(stream, token) {
  const url = new URL("https://api.twitch.tv/helix/users")
  const params = { id: stream.user_id }
  url.search = new URLSearchParams(params).toString()
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Client-Id": clientId,
    },
  })

  const data = await res.json()
  return data.data[0].profile_image_url
}

// append to DOM
function appendStream(stream, avatar) {
  const thumbnail = stream.thumbnail_url
    .replace("{width}", 300)
    .replace("{height}", 160)

  streams.innerHTML += `
  <div class="stream">
  <a target="_blank" href="https://www.twitch.tv/${stream.user_login}">
      <div class="shadow">
        <img class="stream__pic" loading="lazy" src=${thumbnail} alt="" />
        <div class="info">
          <img src=${avatar} alt="" />
          <div class="info__text">
            <p class="stream__name">${stream.title}</p>
            <p class="streamer">${stream.user_name}</p>
          </div>
        </div>
      </div>
      </a>
    </div>
 `
}

// loop over the fetched streams
async function setStreams(stream, token) {
  stream.forEach(async s => {
    const avatar = await getAvatar(s, token)
    appendStream(s, avatar)
  })
}

// main load page func
async function loadPage(lang) {
  try {
    streamsData = await getStreams(lang, token, cursor)
    data = streamsData.data
    cursor = streamsData.cursor

    setStreams(data.data, token)
  } catch (error) {
    throw new Error(error)
  }
}
async function initLoad() {
  token = await getToken()
  loadPage(lang)
}

initLoad()

// switch language buttons
buttons.forEach(b =>
  b.addEventListener("click", function handleButtons() {
    if (this.className === lang) return

    lang = this.className
    title.textContent = lang === "en" ? En.TITLE : Zh.TITLE
    streams.innerHTML = ""
    // also need to reset the cursor
    cursor = ""
    loadPage(lang)
  })
)

// infinite scroll
window.addEventListener("scroll", async () => {
  if (
    Math.round(window.innerHeight + window.scrollY) >=
    document.body.offsetHeight
  ) {
    streamsData = await getStreams(lang, token, cursor)
    data = streamsData.data
    cursor = streamsData.cursor

    setStreams(data.data, token)
  }
})
