export const toLocalDateInputValue = (dateInput: string | Date) => {
  if (typeof dateInput === "string") {
    const [datePart] = dateInput.split("T");
    const [year, month, day] = datePart.split("-");
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
  }
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString("pt-BR");
};
