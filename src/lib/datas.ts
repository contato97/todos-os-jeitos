// Datas no fuso de Sao Paulo, no formato do banco (AAAA-MM-DD).
// Ficam fora dos componentes porque ler o relogio e uma "acao impura":
// o React prefere que componentes so transformem dados.

const FUSO = "America/Sao_Paulo";

export function diaEmSaoPaulo(data: Date) {
  return data.toLocaleDateString("en-CA", { timeZone: FUSO });
}

export function hoje() {
  return diaEmSaoPaulo(new Date());
}

export function diasAtras(dias: number) {
  return diaEmSaoPaulo(new Date(Date.now() - dias * 24 * 3600 * 1000));
}

export function agoraIso() {
  return new Date().toISOString();
}
