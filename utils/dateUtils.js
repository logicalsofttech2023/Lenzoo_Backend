export const calculateEndDate = (startDate, durationInDays) => {
  const end = new Date(startDate);
  end.setDate(end.getDate() + durationInDays);
  return end;
};
