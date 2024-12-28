import { supabase } from "../supabaseClient";

export class StartupController {
  async createStartup(req: any, res: any) {
    try {
      const {
        title,
        type,
        stage,
        description,
        category,
        teamSize,
        website,
        roles,
      } = req.body;

      const userId = req.user?.id;

      console.log("userId" + userId);

      if (!userId) {
        return res.status(401).json({
          error: "Unauthorized: User ID is required",
        });
      }

      // Validate required fields
      if (!title || !description || !category) {
        return res.status(400).json({
          error:
            "Missing required fields: title, description, and category are required",
        });
      }

      // Check for existing startup with same name by this user
      const { data: existingStartup, error: checkError } = await supabase
        .from("startups")
        .select("id")
        .eq("title", title)
        .eq("user_id", userId)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 is the "not found" error code
        console.error("Error checking existing startup:", checkError);
        return res.status(500).json({
          error: "Failed to check existing startup",
          details: checkError.message,
        });
      }

      if (existingStartup) {
        return res.status(400).json({
          error: "You already have a startup project with this name",
        });
      }

      // First, insert the startup
      const { data: startupData, error: startupError } = await supabase
        .from("startups")
        .insert([
          {
            title,
            type,
            stage,
            description,
            category,
            team_size: teamSize,
            website_url: website,
            created_at: new Date(),
            user_id: userId, // Add the user_id to the startup record
          },
        ])
        .select();

      if (startupError) {
        console.error("Error creating startup:", startupError);
        return res.status(500).json({
          error: "Failed to create startup",
          details: startupError.message,
        });
      }

      const startupId = startupData[0].id;

      // Then, insert all roles for this startup
      if (roles && roles.length > 0) {
        const rolesWithStartupId = roles?.map((role: any) => ({
          startup_id: startupId,
          title: role.title,
          details: role.details,
          payment_type: role.paymentType,
          user_id: userId, // Add the user_id to each role record
        }));

        const { error: rolesError } = await supabase
          .from("startup_roles")
          .insert(rolesWithStartupId);

        if (rolesError) {
          console.error("Error creating roles:", rolesError);
          // You might want to delete the startup if roles creation fails
          await supabase.from("startups").delete().eq("id", startupId);
          return res.status(500).json({
            error: "Failed to create roles",
            details: rolesError.message,
          });
        }
      }

      return res.status(201).json({
        message: "Startup created successfully",
        startup: startupData[0],
      });
    } catch (error: any) {
      console.error("Server error:", error);
      return res.status(500).json({
        error: "Internal server error",
        details: error.message,
      });
    }
  }
}
