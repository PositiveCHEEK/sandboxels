// 1. Ядро бури (начальный пиксель)
elements.wither_storm_core = {
    color: "#FFB366", // светло-оранжевый
    behavior: [
        "XX|DL|XX",
        "M1 AND CR:wither_flesh|M1 AND CR:wither_flesh|M1 AND CR:wither_flesh", // Все соседи -> wither_flesh
        "M1|M1|M1",
    ],
    category: "weapons",
    density: 9999,
    state: "solid",
    temp: 0,
    tick: function(pixel) {
        // Считаем поглощённые пиксели
        if (!pixel.charge) pixel.charge = 0;
        // Если вокруг есть не-wither_flesh элементы, поглощаем их
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const x = pixel.x + i;
                const y = pixel.y + j;
                if (!isEmpty(x, y) && pixelMap[x][y].element !== "wither_flesh" && pixelMap[x][y].element !== "wither_storm_core") {
                    pixel.charge++;
                    changePixel(pixelMap[x][y], "wither_flesh");
                }
            }
        }
        // При 50 поглощениях создаём 3 глаза
        if (pixel.charge >= 50 && !pixel.hasEyes) {
            createEyes(pixel.x, pixel.y);
            pixel.hasEyes = true;
        }
    },
};

// 2. Тело бури (масса)
elements.wither_flesh = {
    color: "#4B0082", // тёмно-фиолетовый
    behavior: [
        "XX|XX|XX",
        "M1|M1|M1", // Может "падать" вниз, если под ним пусто
        "M2|M2|M2",
    ],
    density: 1500,
    state: "solid",
};

// 3. Глаза бури (появляются позже)
elements.wither_eye = {
    color: "#DA70D6", // пурпурный
    behavior: [
        "XX|SHOT:wither_beam%10|XX", // 10% шанс выстрела лучом
        "DL|DL|DL",
    ],
    tick: function(pixel) {
        // Притягиваем элементы к себе (радиус 3)
        for (let i = -3; i <= 3; i++) {
            for (let j = -3; j <= 3; j++) {
                const x = pixel.x + i;
                const y = pixel.y + j;
                if (!isEmpty(x, y) && pixelMap[x][y].element !== "wither_flesh" && pixelMap[x][y].element !== "wither_storm_core") {
                    movePixel(pixelMap[x][y], pixel.x, pixel.y); // Тянем к центру глаза
                }
            }
        }
    },
    lifetime: 500,
};

// 4. Луч глаза (удаляет элементы)
elements.wither_beam = {
    color: "#E6E6FA", // светло-фиолетовый
    behavior: behaviors.BOUNCY,
    reactions: {
        "anything": { elem1: null } // Уничтожает всё на пути
    },
    lifetime: 20,
};

// Функция создания 3 глаз над массой
function createEyes(x, y) {
    const offsets = [[-2, -5], [0, -6], [2, -5]]; // Расположение глаз
    for (let [dx, dy] of offsets) {
        const eyeX = x + dx;
        const eyeY = y + dy;
        if (isEmpty(eyeX, eyeY)) {
            createPixel("wither_eye", eyeX, eyeY);
        }
    }
}
