import { z } from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaBook,
  FaBriefcase,
  FaMedal,
  FaTools,
  FaLanguage,
  FaPlus,
  FaTrash,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  ImageRun,
  Table,
  WidthType,
  TableRow,
  TableCell,
  HeadingLevel,
  VerticalAlign,
  ShadingType,
} from "docx";
import { saveAs } from "file-saver";
import axios from "axios";
import { useAuthContext } from "@/contexts/AuthContext";

// import githubPic from "../../public/github.png";
// import linkedinPic from "../../public/linkedin.png";

// const fs = require("fs");

const githubPic =
  "C:UsersSivanPesahovDesktopProgectsJobFlowJobFlow-frontpubliclinkedin.png";

interface EducationItem {
  degree: string;
  institution: string;
  graduationYear: string;
  description: string;
}

interface ExperienceItem {
  jobTitle: string;
  company: string;
  startYear: string;
  endYear: string;
  description: string;
}

interface MilitaryItem {
  role: string;
  startYear: string;
  endYear: string;
}

interface UserData {
  name: string;
  phone: string;
  email: string;
  linkedIn: string;
  github: string;
  profile: string;
  education: EducationItem[];
  experience: ExperienceItem[];
  military: MilitaryItem[];
  skills: string;
  languages: string;
}

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name can't be longer than 50 characters"),
  phone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .max(15, "Phone can't be longer than 15 digits"),
  linkedIn: z.string().url("LinkedIn must be a valid URL").optional(),
  github: z.string().url("GitHub must be a valid URL").optional(),
  profile: z
    .string()
    .min(20, "Profile must be at least 20 characters")
    .max(500, "Profile can't be longer than 500 characters"),
  email: z
    .string()
    .min(10, "Email must be at least 10 characters")
    .max(50, "Email can't be longer than 50 characters"),
  education: z
    .array(
      z.object({
        degree: z
          .string()
          .min(2, "Degree must be at least 2 characters")
          .max(50, "Degree can't be longer than 50 characters"),
        institution: z
          .string()
          .min(2, "Institution must be at least 2 characters")
          .max(100, "Institution can't be longer than 100 characters"),
        startDate: z.preprocess(
          (arg) => {
            return typeof arg === "string" ? new Date(arg) : arg;
          },
          z.date().refine((date) => !isNaN(date.getTime()), "Invalid date")
        ),
        endDate: z.preprocess(
          (arg) => {
            return typeof arg === "string" ? new Date(arg) : arg;
          },
          z.date().refine((date) => !isNaN(date.getTime()), "Invalid date")
        ),
        description: z
          .string()
          .min(10, "Description must be at least 10 characters")
          .max(300, "Description can't be longer than 300 characters"),
      })
    )
    .optional(),
  experience: z
    .array(
      z.object({
        jobTitle: z
          .string()
          .min(2, "Job title must be at least 2 characters")
          .max(50, "Job title can't be longer than 50 characters"),
        company: z
          .string()
          .min(2, "Company must be at least 2 characters")
          .max(100, "Company can't be longer than 100 characters"),
        startDate: z.preprocess(
          (arg) => {
            return typeof arg === "string" ? new Date(arg) : arg;
          },
          z.date().refine((date) => !isNaN(date.getTime()), "Invalid date")
        ),
        endDate: z.preprocess(
          (arg) => {
            return typeof arg === "string" ? new Date(arg) : arg;
          },
          z.date().refine((date) => !isNaN(date.getTime()), "Invalid date")
        ),
        description: z
          .string()
          .min(10, "Description must be at least 10 characters")
          .max(300, "Description can't be longer than 300 characters"),
      })
    )
    .optional(),
  military: z
    .array(
      z.object({
        serviceBranch: z
          .string()
          .min(2, "Service Branch must be at least 2 characters")
          .max(50, "Service Branch can't be longer than 50 characters"),
        role: z
          .string()
          .min(2, "Role must be at least 2 characters")
          .max(50, "Role can't be longer than 50 characters"),
        startDate: z.preprocess(
          (arg) => {
            return typeof arg === "string" ? new Date(arg) : arg;
          },
          z.date().refine((date) => !isNaN(date.getTime()), "Invalid date")
        ),
        endDate: z.preprocess(
          (arg) => {
            return typeof arg === "string" ? new Date(arg) : arg;
          },
          z.date().refine((date) => !isNaN(date.getTime()), "Invalid date")
        ),
        description: z
          .string()
          .min(10, "Description must be at least 10 characters")
          .max(300, "Description can't be longer than 300 characters"),
      })
    )
    .optional(),
  skills: z
    .array(
      z
        .string()
        .min(2, "Skill must be at least 2 characters")
        .max(50, "Skill can't be longer than 50 characters")
    )
    .optional(),
  languages: z
    .array(
      z
        .string()
        .min(2, "Language must be at least 2 characters")
        .max(50, "Language can't be longer than 50 characters")
    )
    .optional(),
});

export type CreateResumePageProps = z.infer<typeof formSchema>;

export default function CreateResumePage({}: CreateResumePageProps) {
  const { toast } = useToast();

  const [isPending, setIsPending] = useState(false);

  const { uploadResume } = useAuthContext();

  const form = useForm<CreateResumePageProps>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      profile: "",
      linkedIn: "",
      github: "",
      email: "",
      education: [],
      experience: [],
      military: [],
      skills: [],
      languages: [],
    },
  });

  const educationFieldArray = useFieldArray({
    control: form.control,
    name: "education",
  });

  const experienceFieldArray = useFieldArray({
    control: form.control,
    name: "experience",
  });

  const militaryFieldArray = useFieldArray({
    control: form.control,
    name: "military",
  });

  const validateArrayFields = (
    fieldsArray: Array<Record<string, any>>,
    sectionName: string
  ) => {
    const lastField = fieldsArray[fieldsArray.length - 1];
    if (
      lastField &&
      Object.values(lastField).some(
        (value) => value === undefined || value === "" || value === null
      )
    ) {
      toast({
        title: `Please complete all fields in ${sectionName} before adding a new one.`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const generateAndDownloadDocument = async (
    userData: UserData
  ): Promise<void> => {
    try {
      // Helper function to create a list of items
      const createList = (items: any[], itemFields: string[]): Paragraph[] => {
        return items.map(
          (item, index) =>
            new Paragraph({
              children: itemFields.map(
                (field, i) =>
                  new TextRun(
                    `${item[field as keyof typeof item]}${
                      i < itemFields.length - 1 ? "\n" : ""
                    }`
                  )
              ),
              spacing: { after: 100 },
            })
        );
      };

      // Helper function for education list
      const createEducationList = (education) => {
        return education.map(
          (edu) =>
            new Paragraph({
              children: [
                new TextRun({
                  text: `${edu.startDate.toLocaleDateString()} - ${edu.endDate.toLocaleDateString()}\n`,
                }),
                new TextRun({ text: edu.degree + "\n", bold: true }),
                new TextRun({ text: edu.institution + "\n" }),
                new TextRun({ text: edu.description + "\n" }),
              ],
              spacing: { after: 100 },
            })
        );
      };

      // Helper function for work experience list
      const createWorkExperienceList = (experience) => {
        return experience.map(
          (exp) =>
            new Paragraph({
              children: [
                new TextRun({
                  text: `${exp.startDate.toLocaleDateString()} - ${exp.endDate.toLocaleDateString()}\n`,
                }),
                new TextRun({ text: exp.jobTitle + "\n", bold: true }),
                new TextRun({ text: exp.company + "\n" }),
                new TextRun({ text: exp.description + "\n" }),
              ],
              spacing: { after: 100 },
            })
        );
      };

      // Helper function for military service list
      const createMilitaryServiceList = (military) => {
        return military.map(
          (service) =>
            new Paragraph({
              children: [
                new TextRun({
                  text: `${service.startDate.toLocaleDateString()} - ${service.endDate.toLocaleDateString()}\n`,
                }),
                new TextRun({ text: service.role + "\n", bold: true }),
              ],
              spacing: { after: 200 },
            })
        );
      };

      const createSeparatorLine = (length) => {
        return new Paragraph({
          children: [
            new TextRun({
              text: "_".repeat(length),
              color: "808080", // Medium grey color
            }),
          ],
          spacing: { after: 200 },
        });
      };

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1000,
                  right: 1500,
                  bottom: 1000,
                  left: 1500,
                },
              },
            },
            children: [
              // Header - Name with specific spacing
              new Paragraph({
                children: [
                  new TextRun({
                    text: userData.name.toUpperCase().split("").join(" "),
                    size: 36,
                    font: "Arial",
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
              }),

              // Two-column layout
              new Table({
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                  insideHorizontal: { style: BorderStyle.NONE },
                  insideVertical: { style: BorderStyle.NONE },
                },
                rows: [
                  new TableRow({
                    children: [
                      // Left column (30% width)
                      new TableCell({
                        width: {
                          size: 34, // Slightly reduced from 36 to accommodate gap
                          type: WidthType.PERCENTAGE,
                        },
                        margins: {
                          right: 400, // Added right margin for gap
                        },
                        children: [
                          // Contact Section
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "C O N T A C T",
                                size: 24,
                                font: "Arial",
                              }),
                            ],
                            spacing: { after: 100 },
                          }),
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: userData.phone + "\n",
                                size: 20,
                              }),
                              new TextRun({
                                text: userData.email + "\n",
                                size: 20,
                              }),
                              new TextRun({
                                text: userData.linkedIn + "\n",
                                size: 20,
                              }),
                              new TextRun({ text: userData.github, size: 20 }),
                            ],
                            spacing: { after: 100 },
                          }),
                          createSeparatorLine(30),

                          // Skills Section
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "S K I L L S",
                                size: 24,
                                font: "Arial",
                              }),
                            ],
                            spacing: { after: 100 },
                          }),
                          new Paragraph({
                            text: userData.skills,
                            spacing: { after: 100 },
                          }),
                          createSeparatorLine(30),

                          // Education Section
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "E D U C A T I O N",
                                size: 24,
                                font: "Arial",
                              }),
                            ],
                            spacing: { after: 200 },
                          }),
                          ...createEducationList(userData.education),
                          createSeparatorLine(30),

                          // Languages Section
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "L A N G U A G E S",
                                size: 24,
                                font: "Arial",
                              }),
                            ],
                            spacing: { after: 200 },
                          }),
                          new Paragraph({
                            text: userData.languages,
                            spacing: { after: 400 },
                          }),
                        ],
                        verticalAlign: VerticalAlign.TOP,
                      }),

                      // Right column (70% width)
                      new TableCell({
                        width: {
                          size: 62, // Slightly reduced from 64 to accommodate gap
                          type: WidthType.PERCENTAGE,
                        },
                        margins: {
                          left: 400, // Added left margin for gap
                        },
                        children: [
                          // Profile Section
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "P R O F I L E",
                                size: 24,
                                font: "Arial",
                              }),
                            ],
                            spacing: { after: 200 },
                          }),
                          new Paragraph({
                            text: userData.profile,
                            spacing: { after: 100 },
                          }),
                          createSeparatorLine(45),

                          // Work Experience Section
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "W O R K   E X P E R I E N C E",
                                size: 24,
                                font: "Arial",
                              }),
                            ],
                            spacing: { after: 200 },
                          }),
                          ...createWorkExperienceList(userData.experience),
                          createSeparatorLine(45),

                          // Military Service Section
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "M I L I T A R Y   S E R V I C E",
                                size: 24,
                                font: "Arial",
                              }),
                            ],
                            spacing: { after: 200 },
                          }),
                          ...createMilitaryServiceList(userData.military),
                        ],
                        verticalAlign: VerticalAlign.TOP,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, "cv.docx");

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", blob, "cv.docx");
      formData.append("upload_preset", "ml_default"); // Replace with your Cloudinary upload preset

      try {
        const uploadResponse = await axios.post(
          "https://api.cloudinary.com/v1_1/dipx5fuza/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Extract URL from response
        const fileUrl = uploadResponse.data.secure_url;
        uploadResume(fileUrl);

        // Optional: Use the URL as needed, e.g., display it, save it to the database, etc.
      } catch (uploadError) {
        console.error("Error uploading file to Cloudinary:", uploadError);
      }
    } catch (error) {
      console.error("Error generating document:", error);
    }
  };

  const onSubmit = (data: CreateResumePageProps) => {
    const parsedData: any = {
      ...data,
      education: data.education?.map((edu) => ({
        ...edu,
        startDate: new Date(edu.startDate),
        endDate: new Date(edu.endDate),
      })),
      experience: data.experience?.map((exp) => ({
        ...exp,
        startDate: new Date(exp.startDate),
        endDate: new Date(exp.endDate),
      })),
      military: data.military?.map((mil) => ({
        ...mil,
        startDate: new Date(mil.startDate),
        endDate: new Date(mil.endDate),
      })),
    };
    generateAndDownloadDocument(parsedData);
    console.log("Form Submitted:", parsedData);
    toast({
      title: "You submitted the CV.",
      variant: "default",
      className:
        "bg-teal-600 text-white border border-green-800 shadow-lg bg-opacity-90 rounded-lg",
    });
  };

  // async function handleEnhance() {
  //   const data = {
  //     profile: "",
  //     educationDescriptions: [],
  //     experienceDescriptions: [],
  //     militaryDescriptions: [],
  //   };
  // }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-r lg:my-[3em] my-2 mx-2  from-orange-100 via-pink-200 to-red-300 dark:from-gray-800 dark:via-gray-900 dark:to-black text-gray-700 dark:text-white shadow-xl rounded-2xl p-6 md:p-10 max-w-full md:max-w-5xl lg:mx-auto">
        <CardHeader className="border-b-[0.2em] border-red-300 dark:border-gray-700 pb-4 md:pb-6 mb-6 md:mb-10">
          <CardTitle className="text-2xl md:text-4xl font-extrabold text-gray-700 dark:text-white">
            Create Your CV
          </CardTitle>
          <CardDescription className="text-sm md:text-lg text-gray-700 dark:text-gray-300 opacity-80">
            Fill out the details below to create your CV.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 md:space-y-10"
            >
              <fieldset disabled={isPending} className="space-y-6 md:space-y-8">
                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-lg md:text-xl font-bold text-gray-700 dark:text-gray-300">
                        <FaUser className="mr-2 text-orange-500 dark:text-indigo-300" />{" "}
                        Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your full name"
                          className="w-full p-3 md:p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white focus:ring-4 focus:ring-yellow-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-lg md:text-xl font-bold text-gray-700 dark:text-gray-300">
                        <FaPhone className="mr-2 text-orange-500 dark:text-indigo-300" />{" "}
                        Phone
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your phone number"
                          className="w-full p-3 md:p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white focus:ring-4 focus:ring-yellow-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="github"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-lg md:text-xl font-bold text-gray-700 dark:text-gray-300">
                        <FaGithub className="mr-2 text-black dark:text-white" />{" "}
                        GitHub
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your GitHub profile URL"
                          className="w-full p-3 md:p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white focus:ring-4 focus:ring-blue-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linkedIn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-lg md:text-xl font-bold text-gray-700 dark:text-gray-300">
                        <FaLinkedin className="mr-2 text-blue-600 dark:text-blue-300" />{" "}
                        LinkedIn
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your LinkedIn profile URL"
                          className="w-full p-3 md:p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white focus:ring-4 focus:ring-blue-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Profile Field */}
                <FormField
                  control={form.control}
                  name="profile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-lg md:text-xl font-bold text-gray-700 dark:text-gray-300">
                        <FaEnvelope className="mr-2 text-orange-500 dark:text-indigo-300" />{" "}
                        Profile
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter your profile"
                          className="w-full p-3 md:p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white focus:ring-4 focus:ring-yellow-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-lg md:text-xl font-bold text-gray-700 dark:text-gray-300">
                        <FaEnvelope className="mr-2 text-orange-500 dark:text-indigo-300" />{" "}
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your email"
                          className="w-full p-3 md:p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white focus:ring-4 focus:ring-yellow-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator className="dark:bg-gray-700" />

                <Button
                  type="button"
                  onClick={() => {
                    const educationArray = form.watch("education") || [];
                    if (validateArrayFields(educationArray, "Education")) {
                      educationFieldArray.append({
                        degree: "",
                        institution: "",
                        startDate: new Date(),
                        endDate: new Date(),
                        description: "",
                      });
                    }
                  }}
                  className="relative inline-flex items-center justify-center px-6 py-3 overflow-hidden bg-transparent font-bold tracking-wide border border-orange-400 dark:border-indigo-300 text-gray-700 dark:text-gray-300 rounded-md shadow-2xl group hover:text-gray-50 transition-all duration-500 ease-in-out mt-6 hover:duration-[0ms] hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 dark:hover:from-blue-600 dark:hover:to-indigo-700 hover:border-transparent"
                >
                  <span className="relative flex items-center">
                    <FaPlus className="mr-2" /> Add Education
                  </span>
                </Button>

                {educationFieldArray.fields.map((item, index) => (
                  <FormItem
                    key={item.id}
                    className="p-4 md:p-6 rounded-xl bg-gray-100 dark:bg-gray-800"
                  >
                    <FormLabel className="flex items-center text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-200">
                      <FaBook className="mr-2 text-orange-500 dark:text-indigo-300" />{" "}
                      Education #{index + 1}
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <Input
                          {...form.register(`education.${index}.degree`)}
                          placeholder="Degree"
                          className="w-full p-3 border border-transparent rounded-xl bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-4 focus:ring-yellow-300"
                        />
                        <Input
                          {...form.register(`education.${index}.institution`)}
                          placeholder="Institution"
                          className="w-full p-3 border border-transparent rounded-xl bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-4 focus:ring-yellow-300"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            type="date"
                            {...form.register(`education.${index}.startDate`)}
                            placeholder="Start Year"
                            className="w-full p-3 border border-transparent rounded-xl bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 focus:ring-4 focus:ring-yellow-300"
                          />
                          <Input
                            type="date"
                            {...form.register(`education.${index}.endDate`)}
                            placeholder="Graduation Year"
                            className="w-full p-3 border border-transparent rounded-xl bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 focus:ring-4 focus:ring-yellow-300"
                          />
                        </div>
                        <Textarea
                          {...form.register(`education.${index}.description`)}
                          placeholder="Description"
                          className="w-full p-3 border border-transparent rounded-xl bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-4 focus:ring-yellow-300"
                        />
                      </div>
                    </FormControl>
                    <Button
                      onClick={() => educationFieldArray.remove(index)}
                      type="button"
                      className="mt-4 bg-red-600 dark:bg-red-700 text-white p-3 md:p-4 rounded-xl hover:bg-red-700 dark:hover:bg-red-800 flex items-center"
                    >
                      <FaTrash className="mr-2" /> Remove
                    </Button>
                  </FormItem>
                ))}

                <Separator className="dark:bg-gray-700" />

                <Button
                  type="button"
                  onClick={() => {
                    const experienceArray = form.watch("experience") || [];
                    if (validateArrayFields(experienceArray, "Experience")) {
                      experienceFieldArray.append({
                        jobTitle: "",
                        company: "",
                        startDate: new Date(),
                        endDate: new Date(),
                        description: "",
                      });
                    }
                  }}
                  className="relative inline-flex items-center justify-center px-6 py-3 overflow-hidden bg-transparent font-bold tracking-wide border border-orange-400 dark:border-indigo-300 text-gray-700 dark:text-gray-300 rounded-md shadow-2xl group hover:text-gray-50 transition-all duration-500 ease-in-out mt-6 hover:duration-[0ms] hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 dark:hover:from-blue-600 dark:hover:to-indigo-700 hover:border-transparent"
                >
                  <FaPlus className="mr-2" /> Add Experience
                </Button>

                {experienceFieldArray.fields.map((item, index) => (
                  <FormItem
                    key={item.id}
                    className="p-4 md:p-6 rounded-xl bg-gray-100 dark:bg-gray-800"
                  >
                    <FormLabel className="flex items-center text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-200">
                      <FaBriefcase className="mr-2 text-orange-500 dark:text-indigo-300" />{" "}
                      Experience #{index + 1}
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <Input
                          {...form.register(`experience.${index}.jobTitle`)}
                          placeholder="Job Title"
                          className="w-full p-3 border border-transparent rounded-xl bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-4 focus:ring-yellow-300"
                        />
                        <Input
                          {...form.register(`experience.${index}.company`)}
                          placeholder="Company"
                          className="w-full p-3 border border-transparent rounded-xl bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-4 focus:ring-yellow-300"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            type="date"
                            {...form.register(`experience.${index}.startDate`)}
                            placeholder="Start Date"
                            className="w-full p-3 border border-transparent rounded-xl bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 focus:ring-4 focus:ring-yellow-300"
                          />
                          <Input
                            type="date"
                            {...form.register(`experience.${index}.endDate`)}
                            placeholder="End Date"
                            className="w-full p-3 border border-transparent rounded-xl bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 focus:ring-4 focus:ring-yellow-300"
                          />
                        </div>
                        <Textarea
                          {...form.register(`experience.${index}.description`)}
                          placeholder="Description"
                          className="w-full p-3 border border-transparent rounded-xl bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-4 focus:ring-yellow-300"
                        />
                      </div>
                    </FormControl>
                    <Button
                      onClick={() => experienceFieldArray.remove(index)}
                      type="button"
                      className="mt-4 bg-red-600 dark:bg-red-700 text-white p-3 md:p-4 rounded-xl hover:bg-red-700 dark:hover:bg-red-800 flex items-center"
                    >
                      <FaTrash className="mr-2" /> Remove
                    </Button>
                  </FormItem>
                ))}

                <Separator className="dark:bg-gray-700" />

                <Button
                  type="button"
                  onClick={() => {
                    const militaryArray = form.watch("military") || [];
                    if (
                      validateArrayFields(militaryArray, "Military Experience")
                    ) {
                      militaryFieldArray.append({
                        serviceBranch: "",
                        role: "",
                        startDate: new Date(),
                        endDate: new Date(),
                        description: "",
                      });
                    }
                  }}
                  className="relative inline-flex items-center justify-center px-6 py-3 overflow-hidden bg-transparent font-bold tracking-wide border border-orange-400 dark:border-indigo-300 text-gray-700 dark:text-gray-300 rounded-md shadow-2xl group hover:text-gray-50 transition-all duration-500 ease-in-out mt-6 hover:duration-[0ms] hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 dark:hover:from-blue-600 dark:hover:to-indigo-700 hover:border-transparent"
                >
                  <FaPlus className="mr-2" /> Add Military Experience
                </Button>

                {militaryFieldArray.fields.map((item, index) => (
                  <FormItem
                    key={item.id}
                    className="p-4 md:p-6 rounded-xl bg-gray-100 dark:bg-gray-800"
                  >
                    <FormLabel className="flex items-center text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-200">
                      <FaMedal className="mr-2 text-orange-500 dark:text-indigo-300" />{" "}
                      Military #{index + 1}
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <Input
                          {...form.register(`military.${index}.serviceBranch`)}
                          placeholder="Service Branch"
                          className="w-full p-3 border border-transparent rounded-xl bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-4 focus:ring-yellow-300"
                        />
                        <Input
                          {...form.register(`military.${index}.role`)}
                          placeholder="Role"
                          className="w-full p-3 border border-transparent rounded-xl bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-4 focus:ring-yellow-300"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            type="date"
                            {...form.register(`military.${index}.startDate`)}
                            placeholder="Start Date"
                            className="w-full p-3 border border-transparent rounded-xl bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 focus:ring-4 focus:ring-yellow-300"
                          />
                          <Input
                            type="date"
                            {...form.register(`military.${index}.endDate`)}
                            placeholder="End Date"
                            className="w-full p-3 border border-transparent rounded-xl bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 focus:ring-4 focus:ring-yellow-300"
                          />
                        </div>
                        <Textarea
                          {...form.register(`military.${index}.description`)}
                          placeholder="Description"
                          className="w-full p-3 border border-transparent rounded-xl bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-white focus:ring-4 focus:ring-yellow-300"
                        />
                      </div>
                    </FormControl>
                    <Button
                      onClick={() => militaryFieldArray.remove(index)}
                      type="button"
                      className="mt-4 bg-red-600 dark:bg-red-700 text-white p-3 md:p-4 rounded-xl hover:bg-red-700 dark:hover:bg-red-800 flex items-center"
                    >
                      <FaTrash className="mr-2" /> Remove
                    </Button>
                  </FormItem>
                ))}

                <Separator className="dark:bg-gray-700" />

                <Button
                  type="button"
                  onClick={() => {
                    const skills = form.watch("skills") || [];
                    if (skills[skills.length - 1]?.trim() === "") {
                      toast({
                        title: `Please complete the current skill before adding a new one.`,
                        variant: "destructive",
                      });
                    } else {
                      form.setValue("skills", [...skills, ""]);
                    }
                  }}
                  className="relative inline-flex items-center justify-center px-6 py-3 overflow-hidden bg-transparent font-bold tracking-wide border border-orange-400 dark:border-indigo-300 text-gray-700 dark:text-gray-300 rounded-md shadow-2xl group hover:text-gray-50 transition-all duration-500 ease-in-out mt-6 hover:duration-[0ms] hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 dark:hover:from-blue-600 dark:hover:to-indigo-700 hover:border-transparent"
                >
                  <FaPlus className="mr-2" /> Add Skill
                </Button>

                {(form.watch("skills") || []).map((skill, index) => (
                  <FormItem key={index} className="flex items-center space-x-4">
                    <FormLabel className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                      <FaTools className="mr-2 text-orange-500 dark:text-indigo-300" />{" "}
                      Skill #{index + 1}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...form.register(`skills.${index}`)}
                        placeholder="Skill"
                        className="w-full p-3 border border-transparent rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 focus:ring-4 focus:ring-yellow-300"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      onClick={() =>
                        form.setValue(
                          "skills",
                          (form.getValues("skills") || []).filter(
                            (_, i) => i !== index
                          )
                        )
                      }
                      className="bg-red-600 dark:bg-red-700 text-white p-3 md:p-4 rounded-xl hover:bg-red-700 dark:hover:bg-red-800"
                    >
                      <FaTrash />
                    </Button>
                  </FormItem>
                ))}

                <Separator className="dark:bg-gray-700" />

                <Button
                  type="button"
                  onClick={() => {
                    const languages = form.watch("languages") || [];
                    if (languages[languages.length - 1]?.trim() === "") {
                      toast({
                        title: `Please complete the current language before adding a new one.`,
                        variant: "destructive",
                      });
                    } else {
                      form.setValue("languages", [...languages, ""]);
                    }
                  }}
                  className="relative inline-flex items-center justify-center px-6 py-3 overflow-hidden bg-transparent font-bold tracking-wide border border-orange-400 dark:border-indigo-300 text-gray-700 dark:text-gray-300 rounded-md shadow-2xl group hover:text-gray-50 transition-all duration-500 ease-in-out mt-6 hover:duration-[0ms] hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 dark:hover:from-blue-600 dark:hover:to-indigo-700 hover:border-transparent"
                >
                  <FaPlus className="mr-2" /> Add Language
                </Button>

                {(form.watch("languages") || []).map((language, index) => (
                  <FormItem key={index} className="flex items-center space-x-4">
                    <FormLabel className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                      <FaLanguage className="mr-2 text-orange-500 dark:text-indigo-300" />{" "}
                      Language #{index + 1}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...form.register(`languages.${index}`)}
                        placeholder="Language"
                        className="w-full p-3 border border-transparent rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 focus:ring-4 focus:ring-yellow-300"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      onClick={() =>
                        form.setValue(
                          "languages",
                          (form.getValues("languages") || []).filter(
                            (_, i) => i !== index
                          )
                        )
                      }
                      className="bg-red-600 dark:bg-red-700 text-white p-3 md:p-4 rounded-xl hover:bg-red-700 dark:hover:bg-red-800"
                    >
                      <FaTrash />
                    </Button>
                  </FormItem>
                ))}

                <Button
                  type="submit"
                  className="w-full relative inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-orange-500 to-pink-600 dark:from-indigo-700 dark:to-purple-800 text-white rounded-full shadow-lg hover:shadow-2xl mt-12 text-lg md:text-xl font-semibold transform transition-transform duration-200 ease-in-out hover:scale-105 hover:from-purple-500 hover:to-pink-500 dark:hover:from-purple-600 dark:hover:to-pink-700"
                >
                  Submit
                </Button>
              </fieldset>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="mt-12 p-6">
          <div className="flex justify-center items-center space-x-4">
            <p className="text-gray-800 dark:text-gray-300 text-sm md:text-md font-bold tracking-widest">
              © 2024 All Rights Reserved
            </p>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
