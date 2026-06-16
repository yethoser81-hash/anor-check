const supabase =
require("../config/supabase");

exports.getSealMap =
async(req,res)=>{

    try{

        const {
            sealID
        } = req.params;

        const {
            data,
            error
        }
        =
        await supabase
        .from("scan_history")
        .select(`
            latitude,
            longitude,
            city,
            country,
            scan_time
        `)
        .eq(
            "seal_id",
            sealID
        );

        if(error){

            throw error;

        }

        res.json({

            success:true,

            sealID,

            points:data

        });

    }

    catch(err){

        res.status(500).json({

            success:false,

            message:
            err.message

        });

    }

};