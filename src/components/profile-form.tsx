"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateProfile } from "@/hooks/users/profile";
import { UserProfile } from "@/types";

const profileFormSchema = z.object({
  first_name: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  last_name: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  gender: z.string().min(1, {
    message: "Please select a gender.",
  }),
  birth_date: z.string().optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm({ profile }: { profile: UserProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const updateProfileMutation = useUpdateProfile();

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
  };

  const fieldVariants = {
    hidden: { opacity: 0 },
    visible: (custom: number) => ({
      opacity: 1,
      transition: {
        delay: custom * 0.1,
        duration: 0.3,
      },
    }),
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      gender: profile?.gender || "male",
      birth_date: profile?.birth_date || "",
    },
  });

  function onSubmit(formValues: ProfileFormValues) {
    const profileData: UserProfile = {
      id: profile.id,
      first_name: formValues.first_name,
      last_name: formValues.last_name,
      gender: formValues.gender,
      birth_date: formValues.birth_date,
    };

    updateProfileMutation.mutate(
      { id: profile.id, data: profileData },
      {
        onSuccess: () => {
          toast("Profile updated", {
            description: "Your profile has been updated successfully.",
          });
          setIsEditing(false);
        },
        onError: (error) => {
          toast.error("Error", {
            description: "Failed to update profile. Please try again.",
          });
          console.error("Error updating profile:", error);
        },
      }
    );
  }

  return (
    <Form {...form}>
      <motion.form
        initial="hidden"
        animate="visible"
        variants={contentVariants}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
      >
        <div className="grid grid-cols-1 min-[1300px]:grid-cols-2 gap-5">
          <motion.div custom={0} variants={fieldVariants}>
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">First Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your first name"
                      className="custom-input text-sm"
                      {...field}
                      disabled={!isEditing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div custom={1} variants={fieldVariants}>
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Last Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your last name"
                      className="custom-input text-sm"
                      {...field}
                      disabled={!isEditing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 min-[1300px]:grid-cols-2 gap-5">
          <motion.div custom={2} variants={fieldVariants}>
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Gender</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!isEditing}
                  >
                    <FormControl className="h-full">
                      <SelectTrigger className="custom-input text-sm min-h-[44px] w-full">
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="custom-dropdown">
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div custom={3} variants={fieldVariants}>
            <FormField
              control={form.control}
              name="birth_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Date of Birth</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value || ""}
                      disabled={!isEditing}
                      className="text-sm custom-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        </div>

        <motion.div
          className="flex justify-end gap-4"
          custom={4}
          variants={fieldVariants}
        >
          <AnimatePresence mode="wait">
            {isEditing ? (
              <>
                <motion.div
                  key="cancel-button"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={updateProfileMutation.isPending}
                    className="w-full font-semibold min-h-[46px] rounded-[12px] mt-4 font-md"
                  >
                    Cancel
                  </Button>
                </motion.div>
                <motion.div
                  key="save-button"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="w-full font-semibold min-h-[46px] rounded-[12px] mt-4 font-md"
                  >
                    {updateProfileMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </motion.div>
              </>
            ) : (
              <motion.div
                key="edit-button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-full font-semibold min-h-[46px] rounded-[12px] mt-4 font-md"
                >
                  Edit Profile
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.form>
    </Form>
  );
}
