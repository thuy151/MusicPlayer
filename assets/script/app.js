/*
    Các bước để xây dựng trang nghe nhạc cơ bản:
    1.render songs
    2.Scoll top
    3.Play/ pause/ seek
    4.CD rotate
    5. Next / prew
    6. Random
    7.Next/ repeat when ended
    8. Active song
    9.Scoll active song into view
    10. Play song when click
    
*/
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = 'PLAYER';

const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd_thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isReapeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [{
            name: 'Độ tộc 2',
            singer: 'Độ Mixi',
            path: './assets/music/Do-Toc-2-Do-Mixi-Phao-Phuc-Du-Masew.mp3',
            image: './assets/img/dotoc2.jpg',
        },
        {
            name: 'Alone',
            singer: 'Alanwalker',
            path: './assets/music/alone.mp3',
            image: './assets/img/alanwalker.jpg',
        },
        {
            name: 'Answer-Love-Myself',
            singer: 'BTS',
            path: './assets/music/Answer-Love-Myself-BTS.mp3',
            image: './assets/img/bts.jpg',
        },
        {
            name: 'Permission-to-Dance',
            singer: 'BTS',
            path: './assets/music/Permission-to-Dance-BTS.mp3',
            image: './assets/img/bts.jpg',
        },
        {
            name: 'TOMBOY',
            singer: 'GIDLE',
            path: './assets/music/TOMBOY-G-I-DLE.mp3',
            image: './assets/img/gidle.jpg',
        },
        {
            name: 'See-You-Again',
            singer: 'charlie puth',
            path: './assets/music/See-You-Again-Absence-Remix-Wiz-Khalifa-Charlie-Puth.mp3',
            image: './assets/img/charlieputh.jpg',
        },
        {
            name: '2AM',
            singer: 'JustaTee-BigDaddy',
            path: './assets/music/2AM-JustaTee-BigDaddy.mp3',
            image: './assets/img/2am.jpg',
        }
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `  
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>`
        });
        playlist.innerHTML = htmls.join('');
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        });
    },
    handleEvents: function() {
        const cdWidth = cd.offsetWidth;

        //xu ly cd quay / dung
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, //10s
            iterations: Infinity
        })
        cdThumbAnimate.pause();

        //xu ly phong to thu nho
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;

        }

        //xu ly khi click play
        playBtn.onclick = function() {
            if (app.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        //khi song duoc player
        audio.onplay = function() {
            app.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        //khi song duoc pause
        audio.onpause = function() {
            app.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        //khi tien do bai hat thay doi
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const processPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = processPercent;
            }
        }

        //Xử lý khi tua bài hát 
        progress.onchange = function(e) {
            if (audio.duration) {
                const seekTime = e.target.value * audio.duration / 100;
                audio.currentTime = seekTime;
            }
        };

        //khi next bai hat
        nextBtn.onclick = function() {
            if (app.isRandom) {
                app.playRandom();
            } else {
                app.nextSong();
            }
            audio.play();
            app.render();
            app.scollToActiveSong();
        }

        //khi prev bai hat
        prevBtn.onclick = function() {
            if (app.isRandom) {
                app.playRandom();
            } else {
                app.prevSong();
            }
            audio.play();
            app.render();
            //khi active thi render lai
            app.scollToActiveSong();

        }

        //khi random bai hat
        randomBtn.onclick = function() {
            app.isRandom = !app.isRandom;
            app.setConfig('isRandom', app.isRandom);
            randomBtn.classList.toggle('active', app.isRandom);
        }

        //xu ly lap lai 1 song
        repeatBtn.onclick = function() {
            app.isReapeat = !app.isReapeat;
            app.setConfig('isReapeat', app.isReapeat);
            repeatBtn.classList.toggle('active', app.isReapeat);
        }

        //xu li next song khi audio ended
        audio.onended = function() {
            if (app.isReapeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        }

        //lang nghe click hanh vi vao playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            if (songNode || !e.target.closest('.option')) {
                if (songNode) {
                    app.currentIndex = Number(songNode.dataset.index);
                    app.render();
                    app.loadCurrentSong();
                    audio.play();

                }
            }
        }
    },
    scollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            })
        }, 300);
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;

    },
    loaConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isReapeat = this.config.isReapeat;
    },
    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    playRandom: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex;
        this.loadCurrentSong();

    },
    start: function() {
        //gan cau hinh tu config vao ung dung
        this.loaConfig();

        //dinh nghia cac thuoc tinh cho object
        this.defineProperties();

        //lang nghe vaf xu ly cac su kien
        this.handleEvents();

        //tai thong tin bai hat dau tien vao Ui khi chayj ung dung
        this.loadCurrentSong();

        //render playlist
        this.render();

        //hien thi trang thai ban dau cu button repeat va random
        repeatBtn.classList.toggle('active', this.isReapeat);
        randomBtn.classList.toggle('active', this.isRandom);
    }
}
app.start()