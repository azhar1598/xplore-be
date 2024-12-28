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

  async getStartups(req: any, res: any) {
    try {
      const userId = req.user?.id;

      // Check if user is authenticated
      if (!userId) {
        return res.status(401).json({
          error: "Unauthorized: User ID is required",
        });
      }

      const {
        page = 1,
        limit = 10,
        category,
        stage,
        type,
        search,
        orderBy = "created_at",
        order = "desc",
      } = req.query;

      // Calculate offset for pagination
      const offset = (Number(page) - 1) * Number(limit);

      // Start building the query with user filter
      let query = supabase
        .from("startups")
        .select(
          `
          *,
          startup_roles (*)
        `,
          { count: "exact" }
        )
        .eq("user_id", userId); // Only get startups for the authenticated user

      // Add additional filters if they exist
      if (category) {
        query = query.eq("category", category);
      }
      if (stage) {
        query = query.eq("stage", stage);
      }
      if (type) {
        query = query.eq("type", type);
      }
      if (search) {
        query = query.or(
          `title.ilike.%${search}%,description.ilike.%${search}%`
        );
      }

      // Add pagination and ordering
      query = query
        .order(orderBy, { ascending: order === "asc" })
        .range(offset, offset + Number(limit) - 1);

      // Execute the query
      const { data: startups, error, count } = await query;

      if (error) {
        console.error("Error fetching startups:", error);
        return res.status(500).json({
          error: "Failed to fetch startups",
          details: error.message,
        });
      }

      if (!startups || startups.length === 0) {
        return res.status(200).json({
          data: [],
          metadata: {
            total: 0,
            page: Number(page),
            limit: Number(limit),
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        });
      }

      // Calculate pagination metadata
      const totalPages = count ? Math.ceil(count / Number(limit)) : 0;
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return res.status(200).json({
        data: startups,
        metadata: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
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
