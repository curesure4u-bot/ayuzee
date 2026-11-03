import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Brain, Camera, Upload, AlertTriangle } from "lucide-react";
import { useState } from "react";

const V2Assessment = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Brain className="h-6 w-6 text-purple-600" /> AI Spine Assessment V2</h1>
          <p className="text-muted-foreground mt-1">Next-gen AI-powered assessment with enhanced scoring</p>
        </div>
        <Badge className="bg-purple-600">₹199 Entry</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Upload */}
        <Card className="col-span-2">
          <CardHeader><CardTitle>Upload Posture Photo</CardTitle></CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm">Click to upload front, side, and back views</p>
              <p className="text-xs text-muted-foreground mt-1">AI will analyze spinal alignment</p>
              <Input type="file" className="mt-4" accept="image/*" />
            </div>
          </CardContent>
        </Card>

        {/* Score */}
        <Card>
          <CardHeader><CardTitle>AI Spine Score</CardTitle></CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-5xl font-bold text-purple-600">45</p>
              <p className="text-sm text-muted-foreground">/100</p>
              <Progress value={45} className="mt-4 h-3" />
              <Badge className="mt-2 bg-amber-500">Needs Attention</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendation */}
      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <p className="font-semibold text-purple-800">AI Recommendation</p>
              <p className="text-sm text-purple-700 mt-1">Based on analysis, we recommend: <strong>7-Day Kati Basti Package</strong></p>
              <p className="text-xs text-purple-600 mt-1">Estimated improvement: 65-75%</p>
              <Button className="mt-3 bg-purple-600" size="sm">Book Package ₹8,500</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default V2Assessment;