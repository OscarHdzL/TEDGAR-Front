export function transformDateForSorting(data: any, type: any): string {
  if (data === null || data.trim() === "") {
    return data;
  } else if (type === "sort" || type === "type") {
    var dateParts = data.split("/");
    return dateParts[2] + dateParts[1] + dateParts[0]; // 'yyyymmdd'
  } else {
    return data;
  }
}
