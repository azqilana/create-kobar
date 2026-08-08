const registry = {};

export function registerPage(name, initFn) {
    registry[name] = initFn;
}

export function runPageInit(name) {
    if (registry[name]) {
        registry[name]();
    } else {
        console.warn(`Tidak ada init terdaftar untuk halaman: ${name}`);
    }
}
