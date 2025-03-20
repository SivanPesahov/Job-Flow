export type IJob = {
  _id: string;
  userId: string;
  position: string;
  company: string;
  company_logo?: string;
  location: string;
  description: string;
  salary?: string;
  link: string;
  status: number;
  order: number;
  custom_resume_link?: string;
  interview_date?: string;
  contract_link?: string;
};
